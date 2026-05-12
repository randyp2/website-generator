package com.webgen.webgen_backend.verification.service.scoring;

import com.webgen.webgen_backend.verification.service.scoring.model.EvidenceLinkSignal;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillClaimInput;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillClaimScore;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillScoreRequest;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillScoreSummary;
import com.webgen.webgen_backend.verification.service.scoring.model.SuggestedAction;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Component
public class SkillVerificationScoringKernel {

    private final SkillScoringPolicy scoringPolicy;
    private final SkillSuggestedActionRuleBook actionRuleBook;
    private final List<SkillScorePostProcessor> scorePostProcessors;
    private static final int STALE_SIGNAL_DAYS_THRESHOLD = 180;
    private static final BigDecimal STRONG_SIGNAL_THRESHOLD = new BigDecimal("0.80");
    private static final String LLM_VERIFIED_PROVIDER = "manual_upload";
    private static final Set<String> LLM_VERIFIED_LINK_TYPES = Set.of(
            "dependency_match",
            "topic_match",
            "llm_document_match"
    );
    private static final BigDecimal LLM_VERIFIED_MIN_CONFIDENCE = new BigDecimal("0.85");

    public SkillVerificationScoringKernel(
            SkillScoringPolicy scoringPolicy,
            SkillSuggestedActionRuleBook actionRuleBook,
            List<SkillScorePostProcessor> scorePostProcessors
    ) {
        this.scoringPolicy = scoringPolicy;
        this.actionRuleBook = actionRuleBook;
        this.scorePostProcessors = scorePostProcessors == null
                ? List.of()
                : List.copyOf(scorePostProcessors);
    }

    /**
     * Calculates the deterministic score summary for skill claims.
     *
     * @param request normalized scoring request
     * @return deterministic score summary
     */
    public SkillScoreSummary score(SkillScoreRequest request) {
        List<SkillClaimInput> inputs = request == null || request.claims() == null
                ? List.of()
                : request.claims();

        BigDecimal requestedParserConfidence = request == null
                ? null
                : request.parserConfidence();
        BigDecimal boundedParserConfidence = requestedParserConfidence == null
                ? null
                : scoringPolicy.clamp01(requestedParserConfidence);

        String scoreType = resolveScoreType(boundedParserConfidence != null, false);

        if (inputs.isEmpty()) {
            return new SkillScoreSummary(
                    scoreType,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    SkillScoringPolicy.ZERO,
                    SkillScoringPolicy.ZERO,
                    boundedParserConfidence,
                    "Upload your resume or add skills manually to get started.",
                    List.of(),
                    List.of(),
                    List.of()
            );
        }

        // Build per-claim baseline/evidence/final values first, then sort for stable output.
        List<ClaimScoreComputation> claimComputations = inputs.stream()
                .map(this::scoreClaim)
                .sorted(
                        Comparator.comparingInt((ClaimScoreComputation c) -> c.score().claimScore()).reversed()
                                .thenComparing(c -> c.score().rawValue() == null
                                        ? ""
                                        : c.score().rawValue(), String.CASE_INSENSITIVE_ORDER)
                )
                .toList();
        List<SkillClaimScore> claimScores = claimComputations.stream()
                .map(ClaimScoreComputation::score)
                .toList();

        int totalSkills = claimScores.size();
        int matchedSkills = (int) claimScores.stream().filter(SkillClaimScore::matched).count();
        // unmatchedSkills = totalSkills - matchedSkills
        int unmatchedSkills = totalSkills - matchedSkills;

        // Coverage tracks breadth of canonical recognition.
        // normalizedCoverage = matchedSkills / totalSkills
        BigDecimal normalizedCoverage = scoringPolicy.safeDivide(BigDecimal.valueOf(matchedSkills), totalSkills);

        // Source-quality tracks average trust priors across all claims.
        // sourceWeightSum = Σ sourceWeight(claim_i.source)
        BigDecimal sourceWeightSum = claimScores.stream()
                .map(c -> scoringPolicy.sourceWeight(c.source()))
                .reduce(SkillScoringPolicy.ZERO, BigDecimal::add);
        // sourceQuality = sourceWeightSum / totalSkills
        BigDecimal sourceQuality = scoringPolicy.safeDivide(sourceWeightSum, totalSkills);

        // Baseline overall tracks the average per-claim prior so the profile score
        // reflects the same evidence-aware prior logic users see on claim cards.
        // claimPrior_i = (0.70 * matchValue_i) + (0.30 * sourceWeight_i)
        // baseNormalizedScore = average(claimPrior_i)
        BigDecimal claimPriorSum = claimComputations.stream()
                .map(ClaimScoreComputation::baselineClaimNormalized)
                .reduce(SkillScoringPolicy.ZERO, BigDecimal::add);
        BigDecimal baseNormalizedScore = scoringPolicy.safeDivide(claimPriorSum, totalSkills);

        // Baseline overall before evidence adjustments.
        BigDecimal baselineOverallNormalized = baseNormalizedScore;
        if (boundedParserConfidence != null) {
            // parser-adjusted baseline:
            //   baseline = 0.90*base + 0.10*parserConfidence
            baselineOverallNormalized = baselineOverallNormalized.multiply(SkillScoringPolicy.BASE_WITH_PARSER_WEIGHT)
                    .add(boundedParserConfidence.multiply(SkillScoringPolicy.PARSER_CONFIDENCE_WEIGHT));
        }

        int baselineOverallScore = scoringPolicy.toPercent(baselineOverallNormalized);

        boolean hasAnyEvidence = claimScores.stream().anyMatch(claim -> claim.evidenceLinksUsed() > 0);
        scoreType = resolveScoreType(boundedParserConfidence != null, hasAnyEvidence);

        /*
         * Overall evidence adjustment strategy:
         *
         * 1) Keep baseline overall as the anchor so existing no-evidence behavior
         *    stays byte-for-byte compatible.
         * 2) Compute mean per-claim evidence contribution in percentage points
         *    from uncapped math-path deltas.
         * 3) Apply the rounded mean delta once at overall level.
         *
         * equation:
         *   meanClaimDelta = average(claim.uncappedEvidenceContribution)
         *   overall        = clamp_0_100(baselineOverallScore + round(meanClaimDelta))
         *
         * Why mean (not sum):
         * - Sum would scale with claim count and over-amplify profiles that simply
         *   have many extracted claims.
         * - Mean keeps adjustments comparable across profiles of different sizes.
        */
        OverallEvidenceComputation overallEvidenceComputation = hasAnyEvidence
                ? computeEvidenceEnhancedOverallScore(baselineOverallScore, claimComputations, matchedSkills)
                : new OverallEvidenceComputation(
                        baselineOverallScore,
                        SkillScoringPolicy.ZERO,
                        SkillScoringPolicy.ZERO,
                        0
                );
        int overallScore = overallEvidenceComputation.overallScore();
        int evidenceDelta = overallScore - baselineOverallScore;

        System.out.println(
                "[BASELINE SCORE] Formula computes initial trust score from average per-claim priors. "
                        + "claimPrior_i = 0.70*matchValue_i + 0.30*sourceWeight_i, "
                        + "base = average(claimPrior_i)"
                        + (boundedParserConfidence == null ? "" : ", final = 0.90*base + 0.10*parserConfidence")
        );
        System.out.println(String.format(
                "[BASELINE SCORE] coverage = matched/total = %d/%d = %s",
                matchedSkills,
                totalSkills,
                normalizedCoverage
        ));
        System.out.println(String.format(
                "[BASELINE SCORE] sourceQuality = sourceWeightSum/total = %s/%d = %s",
                sourceWeightSum,
                totalSkills,
                sourceQuality
        ));
        System.out.println(String.format(
                "[BASELINE SCORE] claimPriorAverage = claimPriorSum/total = %s/%d = %s",
                claimPriorSum,
                totalSkills,
                baseNormalizedScore
        ));
        if (boundedParserConfidence != null) {
            System.out.println(String.format(
                    "[BASELINE SCORE] finalNormalized = (0.90*%s) + (0.10*%s) = %s",
                    baseNormalizedScore,
                    boundedParserConfidence,
                    baselineOverallNormalized
            ));
        }
        System.out.println(String.format(
                "[BASELINE SCORE] baselineOverallScore = round(100*%s) = %d",
                baselineOverallNormalized,
                baselineOverallScore
        ));
        if (hasAnyEvidence) {
            System.out.println(String.format(
                    "[EVIDENCE SCORE] meanClaimDelta = totalClaimDelta/matchedClaims = %s/%d = %s",
                    overallEvidenceComputation.totalClaimDelta(),
                    Math.max(1, matchedSkills),
                    overallEvidenceComputation.averageClaimDelta()
            ));
            System.out.println(String.format(
                    "[EVIDENCE SCORE] finalOverallScore = clamp_0_100(%d + %d) = %d",
                    baselineOverallScore,
                    overallEvidenceComputation.roundedAverageDelta(),
                    overallScore
            ));
        }
        System.out.println(String.format(
                "[EVIDENCE SCORE] hasEvidence=%s evidenceDelta=%d finalOverallScore=%d (scoreType=%s)",
                hasAnyEvidence,
                evidenceDelta,
                overallScore,
                scoreType
        ));

        List<SkillClaimScore> unverifiedClaims = claimScores.stream()
                .filter(c -> !"verified".equals(c.status()))
                .toList();

        List<SuggestedAction> suggestedActions = buildSuggestedActions(unverifiedClaims);

        String profileScoreNarrative = buildProfileScoreNarrative(
                overallScore,
                baselineOverallScore,
                evidenceDelta,
                matchedSkills,
                totalSkills,
                unmatchedSkills,
                scoreType
        );

        SkillScoreSummary deterministicSummary = new SkillScoreSummary(
                scoreType,
                baselineOverallScore,
                evidenceDelta,
                overallScore,
                totalSkills,
                matchedSkills,
                unmatchedSkills,
                normalizedCoverage,
                sourceQuality,
                boundedParserConfidence,
                profileScoreNarrative,
                claimScores,
                unverifiedClaims,
                suggestedActions
        );

        return applyPostProcessors(deterministicSummary, request);
    }

    /**
     * Scores a single claim with deterministic match/source weighting.
     *
     * @param input normalized claim input
     * @return scored claim
     */
    private ClaimScoreComputation scoreClaim(SkillClaimInput input) {
        String source = scoringPolicy.normalizeSource(input.source());
        String status = scoringPolicy.normalizeStatus(input.status());
        String category = scoringPolicy.normalizeCategory(input.canonicalCategory());

        boolean matched = input.canonicalSkillId() != null;
        List<EvidenceLinkSignal> evidenceLinks = input.evidenceLinks() == null
                ? List.of()
                : input.evidenceLinks();
        int evidenceLinksUsed = evidenceLinks.size();
        int evidenceLinksUsedForScoring = matched ? evidenceLinksUsed : 0;

        BigDecimal sourceWeight = scoringPolicy.sourceWeight(source);
        BigDecimal matchValue = resolveMatchValue(matched);
        boolean llmVerified = isLlmVerified(input);
        int claimScoreCap = resolveClaimScoreCap(llmVerified);
        System.out.println(String.format(
                "[CLAIM SCORE][LLM] claimId=%s llmVerified=%s claimScoreCap=%d",
                input.claimId(),
                llmVerified,
                claimScoreCap
        ));

        // claimPriorNormalized =
        //   (matchValue   * COVERAGE_WEIGHT)
        // + (sourceWeight * SOURCE_QUALITY_WEIGHT)
        BigDecimal baselineClaimNormalized = matchValue.multiply(SkillScoringPolicy.COVERAGE_WEIGHT)
                .add(sourceWeight.multiply(SkillScoringPolicy.SOURCE_QUALITY_WEIGHT));

        // baselineClaimScore = min(round(100 * baselineClaimNormalized), claimScoreCap)
        int uncappedBaselineClaimScore = scoringPolicy.toPercent(baselineClaimNormalized);
        int baselineClaimScore = Math.min(uncappedBaselineClaimScore, claimScoreCap);

        System.out.println(String.format(
                "[CLAIM SCORE] claimId=%s rawValue=%s source=%s matched=%s status=%s",
                input.claimId(),
                input.rawValue(),
                source,
                matched,
                status
        ));
        System.out.println(String.format(
                "[CLAIM SCORE] claimId=%s baselineNormalized = (0.70*%s) + (0.30*%s) = %s -> baselineScore=%d",
                input.claimId(),
                matchValue,
                sourceWeight,
                baselineClaimNormalized,
                baselineClaimScore
        ));

        String state = resolveClaimState(matched, status);

        BigDecimal canonicalWeight = input.canonicalWeight() == null
                ? SkillScoringPolicy.ZERO
                : scoringPolicy.clamp01(input.canonicalWeight());

        BigDecimal finalClaimNormalized = baselineClaimNormalized;
        EvidenceNudgeComputation evidenceNudge = EvidenceNudgeComputation.none();
        if (evidenceLinksUsed > 0) {
            for (int i = 0; i < evidenceLinksUsed; i++) {
                EvidenceLinkSignal link = evidenceLinks.get(i);
                BigDecimal boundedStrength = link == null || link.decayedStrength() == null
                        ? SkillScoringPolicy.ZERO
                        : scoringPolicy.clamp01(link.decayedStrength());
                System.out.println(String.format(
                        "[CLAIM SCORE] claimId=%s evidence[%d] type=%s rawWeight=%s recencyMultiplier=%s ageDays=%d decayedStrength=%s",
                        input.claimId(),
                        i,
                        link == null ? null : link.linkType(),
                        link == null ? null : link.linkTypeWeight(),
                        link == null ? null : link.recencyDecay(),
                        link == null ? null : link.ageDays(),
                        boundedStrength
                ));
            }

            if (matched) {
                evidenceNudge = computeEvidenceNudge(evidenceLinks, baselineClaimNormalized, claimScoreCap);
                finalClaimNormalized = evidenceNudge.finalClaimNormalized();
                System.out.println(String.format(
                        "[CLAIM SCORE] claimId=%s evidenceNudge effectiveEvidence=%s support=%s boostProgress=%s "
                                + "headroom=%s boostNormalized=%s",
                        input.claimId(),
                        evidenceNudge.effectiveEvidenceStrength(),
                        evidenceNudge.support(),
                        evidenceNudge.boostProgress(),
                        evidenceNudge.headroomNormalized(),
                        evidenceNudge.boostNormalized()
                ));
                System.out.println(String.format(
                        "[CLAIM SCORE] claimId=%s finalNormalized = baseline + (headroom*boostProgress) = %s + (%s*%s) = %s "
                                + "-> finalScore pending-cap",
                        input.claimId(),
                        baselineClaimNormalized,
                        evidenceNudge.headroomNormalized(),
                        evidenceNudge.boostProgress(),
                        finalClaimNormalized
                ));
            } else {
                System.out.println(String.format(
                        "[CLAIM SCORE] claimId=%s evidence links present but claim is unresolved; skipping evidence nudge until canonical match exists",
                        input.claimId()
                ));
            }
        }
        finalClaimNormalized = scoringPolicy.clamp01(finalClaimNormalized);

        int uncappedFinalClaimScore = scoringPolicy.toPercent(finalClaimNormalized);
        int finalClaimScore = Math.min(uncappedFinalClaimScore, claimScoreCap);
        int uncappedEvidenceContribution = evidenceLinksUsedForScoring > 0
                ? uncappedFinalClaimScore - uncappedBaselineClaimScore
                : 0;
        int evidenceContribution = evidenceLinksUsedForScoring > 0
                ? finalClaimScore - baselineClaimScore
                : 0;
        boolean baselineScoreCapped = baselineClaimScore < uncappedBaselineClaimScore;
        boolean finalScoreCapped = finalClaimScore < uncappedFinalClaimScore;

        EvidenceSignalStats evidenceStats = evidenceLinksUsedForScoring > 0
                ? collectEvidenceSignalStats(evidenceLinks)
                : EvidenceSignalStats.empty();
        if (evidenceLinksUsedForScoring > 0) {
            System.out.println(String.format(
                    "[CLAIM SCORE] claimId=%s finalScore=%d baselineScore=%d evidenceContribution=%+d linksUsed=%d",
                    input.claimId(),
                    finalClaimScore,
                    baselineClaimScore,
                    evidenceContribution,
                    evidenceLinksUsedForScoring
            ));
            if (evidenceContribution < 0) {
                BigDecimal normalizedGap = finalClaimNormalized.subtract(baselineClaimNormalized);
                BigDecimal weightedGapNormalized = normalizedGap;
                BigDecimal weightedGapPoints = weightedGapNormalized.multiply(SkillScoringPolicy.HUNDRED)
                        .setScale(4, RoundingMode.HALF_UP);

                System.out.println(String.format(
                        "[CLAIM SCORE][NEGATIVE] claimId=%s reason=evidence_normalized_below_baseline "
                                + "baselineNormalized=%s finalNormalized=%s normalizedGap=%s "
                                + "weightedGapPointsApprox=%s",
                        input.claimId(),
                        baselineClaimNormalized,
                        finalClaimNormalized,
                        normalizedGap,
                        weightedGapPoints
                ));
                System.out.println(String.format(
                        "[CLAIM SCORE][NEGATIVE] claimId=%s linksUsed=%d stale180=%d stale365=%d "
                                + "strongestSignal={type=%s,strength=%s,ageDays=%s} "
                                + "weakestSignal={type=%s,strength=%s,ageDays=%s}",
                        input.claimId(),
                        evidenceLinksUsed,
                        evidenceStats.stale180Count(),
                        evidenceStats.stale365Count(),
                        evidenceStats.strongestType(),
                        evidenceStats.strongestStrength(),
                        evidenceStats.strongestAgeDays(),
                        evidenceStats.weakestType(),
                        evidenceStats.weakestStrength(),
                        evidenceStats.weakestAgeDays()
                ));
            }
        } else if (evidenceLinksUsed > 0) {
            System.out.println(String.format(
                    "[CLAIM SCORE] claimId=%s evidence links ignored for unresolved claim -> finalScore=%d",
                    input.claimId(),
                    finalClaimScore
            ));
        } else {
            System.out.println(String.format(
                    "[CLAIM SCORE] claimId=%s no evidence links -> finalScore=%d",
                    input.claimId(),
                    finalClaimScore
            ));
        }
        if (baselineScoreCapped || finalScoreCapped) {
            System.out.println(String.format(
                    "[CLAIM SCORE][CAP] claimId=%s llmVerified=%s claimScoreCap=%d "
                            + "uncappedBaseline=%d baselineScore=%d uncappedFinal=%d finalScore=%d "
                            + "uncappedEvidenceContribution=%+d displayEvidenceContribution=%+d",
                    input.claimId(),
                    llmVerified,
                    claimScoreCap,
                    uncappedBaselineClaimScore,
                    baselineClaimScore,
                    uncappedFinalClaimScore,
                    finalClaimScore,
                    uncappedEvidenceContribution,
                    evidenceContribution
            ));
        }

        ClaimReasonComputation claimReason = buildClaimReason(
                matched,
                evidenceLinksUsedForScoring,
                baselineClaimScore,
                finalClaimScore,
                evidenceContribution,
                evidenceStats
        );
        if (finalScoreCapped) {
            claimReason = new ClaimReasonComputation(
                    "expert_reserved_llm",
                    "You've hit the max score we can give automatically. "
                            + "Higher scores require a deeper review — that feature is coming soon."
            );
        }
        System.out.println(String.format(
                "[CLAIM SCORE][REASON] claimId=%s code=%s text=%s",
                input.claimId(),
                claimReason.code(),
                claimReason.text()
        ));

        SkillClaimScore score = new SkillClaimScore(
                input.claimId(),
                input.rawValue(),
                input.canonicalSkillId(),
                input.canonicalSkillName(),
                source,
                status,
                matched,
                state,
                category,
                canonicalWeight,
                baselineClaimScore,
                evidenceContribution,
                evidenceLinksUsedForScoring,
                finalClaimScore,
                claimReason.code(),
                claimReason.text()
        );

        return new ClaimScoreComputation(score, uncappedEvidenceContribution, baselineClaimNormalized);
    }

    // Resolves canonical match prior without using evidence as a binary jump.
    private BigDecimal resolveMatchValue(boolean matched) {
        if (!matched) {
            return SkillScoringPolicy.ZERO;
        }
        return SkillScoringPolicy.MATCHED_WITHOUT_EVIDENCE_VALUE;
    }

    /**
     * Computes deterministic evidence nudge toward the claim cap.
     *
     * Equation:
     *
     * effectiveEvidence = Σ(decayedStrength_i * rankDecay^(i-1))
     * support           = 1 - exp(-gamma * effectiveEvidence)
     * boostProgress     = support^curveExponent
     * headroom          = capNormalized - baselineClaimNormalized
     * final             = baselineClaimNormalized + (headroom * boostProgress)
     *
     * Design intent:
     * - Low evidence nudges scores up a little.
     * - More/stronger/fresher evidence increases the nudge.
     * - Diminishing returns prevent linear inflation from many links.
     */
    private EvidenceNudgeComputation computeEvidenceNudge(
            List<EvidenceLinkSignal> evidenceLinks,
            BigDecimal baselineClaimNormalized,
            int claimScoreCap
    ) {
        BigDecimal capNormalized = resolveClaimCapNormalized(claimScoreCap);
        BigDecimal headroomNormalized = capNormalized.subtract(baselineClaimNormalized);
        if (headroomNormalized.compareTo(SkillScoringPolicy.ZERO) <= 0) {
            return new EvidenceNudgeComputation(
                    SkillScoringPolicy.ZERO,
                    SkillScoringPolicy.ZERO,
                    SkillScoringPolicy.ZERO,
                    SkillScoringPolicy.ZERO,
                    SkillScoringPolicy.ZERO,
                    scoringPolicy.clamp01(baselineClaimNormalized)
            );
        }

        BigDecimal effectiveEvidenceStrength = aggregateEvidenceStrengthWithRankDecay(evidenceLinks);
        BigDecimal support = computeEvidenceSupport(effectiveEvidenceStrength);
        BigDecimal boostProgress = computeEvidenceBoostProgress(support);
        BigDecimal boostNormalized = headroomNormalized.multiply(boostProgress);
        BigDecimal finalClaimNormalized = scoringPolicy.clamp01(
                baselineClaimNormalized.add(boostNormalized)
        );

        return new EvidenceNudgeComputation(
                effectiveEvidenceStrength,
                support,
                boostProgress,
                headroomNormalized,
                boostNormalized,
                finalClaimNormalized
        );
    }

    // Builds additive effective evidence while discounting deeper links by rank.
    private BigDecimal aggregateEvidenceStrengthWithRankDecay(List<EvidenceLinkSignal> evidenceLinks) {
        if (evidenceLinks == null || evidenceLinks.isEmpty()) {
            return SkillScoringPolicy.ZERO;
        }

        BigDecimal total = SkillScoringPolicy.ZERO;
        for (int i = 0; i < evidenceLinks.size(); i++) {
            EvidenceLinkSignal link = evidenceLinks.get(i);
            BigDecimal boundedStrength = link == null || link.decayedStrength() == null
                    ? SkillScoringPolicy.ZERO
                    : scoringPolicy.clamp01(link.decayedStrength());
            BigDecimal rankDecay = BigDecimal.valueOf(
                    Math.pow(SkillScoringPolicy.EVIDENCE_FREQUENCY_RANK_DECAY.doubleValue(), i)
            );
            total = total.add(boundedStrength.multiply(rankDecay));
        }
        return total;
    }

    // Converts effective evidence into bounded support with diminishing returns.
    private BigDecimal computeEvidenceSupport(BigDecimal effectiveEvidenceStrength) {
        if (effectiveEvidenceStrength == null || effectiveEvidenceStrength.compareTo(SkillScoringPolicy.ZERO) <= 0) {
            return SkillScoringPolicy.ZERO;
        }

        double exponent = SkillScoringPolicy.EVIDENCE_SUPPORT_GROWTH_GAMMA.negate().doubleValue()
                * effectiveEvidenceStrength.doubleValue();
        double support = 1.0d - Math.exp(exponent);
        return scoringPolicy.clamp01(BigDecimal.valueOf(support));
    }

    // Sharpens small support values so weak evidence creates only small boosts.
    private BigDecimal computeEvidenceBoostProgress(BigDecimal support) {
        if (support == null || support.compareTo(SkillScoringPolicy.ZERO) <= 0) {
            return SkillScoringPolicy.ZERO;
        }
        double boostProgress = Math.pow(
                support.doubleValue(),
                SkillScoringPolicy.EVIDENCE_BOOST_CURVE_EXPONENT.doubleValue()
        );
        return scoringPolicy.clamp01(BigDecimal.valueOf(boostProgress));
    }

    // Converts an integer claim cap into normalized [0,1] space.
    private BigDecimal resolveClaimCapNormalized(int claimScoreCap) {
        return BigDecimal.valueOf(claimScoreCap)
                .divide(SkillScoringPolicy.HUNDRED, SkillScoringPolicy.DIV_SCALE, RoundingMode.HALF_UP);
    }

    // Placeholder seam for future LLM verification signal integration.
    private boolean isLlmVerified(SkillClaimInput input) {
        if (input == null || input.canonicalSkillId() == null) {
            return false;
        }
        List<EvidenceLinkSignal> evidenceLinks = input.evidenceLinks();
        if (evidenceLinks == null || evidenceLinks.isEmpty()) {
            return false;
        }

        return evidenceLinks.stream().anyMatch(this::isEligibleLlmVerificationSignal);
    }

    private boolean isEligibleLlmVerificationSignal(EvidenceLinkSignal link) {
        if (link == null) {
            return false;
        }

        String provider = normalizeLower(link.provider());
        if (!LLM_VERIFIED_PROVIDER.equals(provider)) {
            return false;
        }

        String linkType = normalizeLower(link.linkType());
        if (!LLM_VERIFIED_LINK_TYPES.contains(linkType)) {
            return false;
        }

        BigDecimal confidence = link.linkConfidence() == null
                ? SkillScoringPolicy.ZERO
                : scoringPolicy.clamp01(link.linkConfidence());
        return confidence.compareTo(LLM_VERIFIED_MIN_CONFIDENCE) >= 0;
    }

    private String normalizeLower(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }

    // Reserves expert-tier claim scores for LLM-verified claims.
    private int resolveClaimScoreCap(boolean llmVerified) {
        return llmVerified
                ? SkillScoringPolicy.MAX_CLAIM_SCORE_WITH_LLM
                : SkillScoringPolicy.MAX_CLAIM_SCORE_WITHOUT_LLM;
    }

    private EvidenceSignalStats collectEvidenceSignalStats(List<EvidenceLinkSignal> evidenceLinks) {
        if (evidenceLinks == null || evidenceLinks.isEmpty()) {
            return EvidenceSignalStats.empty();
        }

        int stale180Count = 0;
        int stale365Count = 0;
        BigDecimal strongestStrength = null;
        BigDecimal weakestStrength = null;
        String strongestType = null;
        String weakestType = null;
        Integer strongestAgeDays = null;
        Integer weakestAgeDays = null;

        for (EvidenceLinkSignal link : evidenceLinks) {
            if (link == null) {
                continue;
            }
            BigDecimal boundedStrength = link.decayedStrength() == null
                    ? SkillScoringPolicy.ZERO
                    : scoringPolicy.clamp01(link.decayedStrength());
            Integer ageDays = link.ageDays();
            if (ageDays != null && ageDays >= STALE_SIGNAL_DAYS_THRESHOLD) {
                stale180Count++;
            }
            if (ageDays != null && ageDays >= 365) {
                stale365Count++;
            }

            if (strongestStrength == null || boundedStrength.compareTo(strongestStrength) > 0) {
                strongestStrength = boundedStrength;
                strongestType = link.linkType();
                strongestAgeDays = ageDays;
            }
            if (weakestStrength == null || boundedStrength.compareTo(weakestStrength) < 0) {
                weakestStrength = boundedStrength;
                weakestType = link.linkType();
                weakestAgeDays = ageDays;
            }
        }

        return new EvidenceSignalStats(
                stale180Count,
                stale365Count,
                strongestStrength,
                weakestStrength,
                strongestType,
                weakestType,
                strongestAgeDays,
                weakestAgeDays
        );
    }

    private String buildProfileScoreNarrative(
            int overallScore,
            int baselineOverallScore,
            int evidenceDelta,
            int matchedSkills,
            int totalSkills,
            int unmatchedSkills,
            String scoreType
    ) {
        boolean isFirstPass = scoreType.equals("initial") || scoreType.equals("initial_with_parser_confidence");

        if (isFirstPass) {
            if (totalSkills == 0) {
                return "Upload your resume or add skills manually to get started.";
            }
            if (matchedSkills == 0) {
                return "Your score is low right now because none of your skills could be recognized yet. "
                        + "Try renaming them to more common terms — once we can recognize them, "
                        + "connecting GitHub or adding portfolio links will push your score up.";
            }
            if (unmatchedSkills > 0) {
                return "This is your starting score — we pulled your skills from your resume but haven't seen any real-world proof yet. "
                        + unmatchedSkills + " skill" + (unmatchedSkills == 1 ? " also couldn't" : "s also couldn't")
                        + " be recognized, which is holding things down. "
                        + "Connect your GitHub or add portfolio links to start raising your score.";
            }
            return "This is your starting score — we pulled your skills from your resume but haven't seen any real-world proof yet. "
                    + "Every skill here needs real-world proof before recruiters can trust it. "
                    + "Connect your GitHub or add portfolio links to start pushing these numbers up.";
        }

        if (evidenceDelta > 0) {
            return "Your projects are backing you up. We found evidence of your skills across your work, "
                    + "which added " + evidenceDelta + " point" + (evidenceDelta == 1 ? "" : "s") + " to your score. "
                    + "Keep adding recent projects to keep building trust.";
        }
        if (evidenceDelta < 0) {
            int drop = Math.abs(evidenceDelta);
            return "We found some evidence, but most of it is older or too indirect to fully back up your claims — "
                    + "that pulled your score down by " + drop + " point" + (drop == 1 ? "" : "s") + ". "
                    + "More recent, hands-on project work will help your score recover.";
        }
        return "We found some activity related to your skills, but not enough to move your score significantly yet. "
                + "More direct proof — like using a skill in a GitHub repo's dependencies — makes a bigger difference.";
    }

    private ClaimReasonComputation buildClaimReason(
            boolean matched,
            int evidenceLinksUsed,
            int baselineClaimScore,
            int finalClaimScore,
            int evidenceContribution,
            EvidenceSignalStats evidenceStats
    ) {
        if (evidenceLinksUsed <= 0) {
            if (matched) {
                return new ClaimReasonComputation(
                        "match_no_evidence",
                        "We found this skill on your resume, but haven't seen it in any of your projects yet. "
                                + "Connect your GitHub or add a portfolio link and your score will go up."
                );
            }
            return new ClaimReasonComputation(
                    "no_match_no_evidence",
                    "We couldn't recognize this skill name. Try using a more common term — "
                            + "for example, \"JavaScript\" instead of \"JS\" — so we can find matching proof for it."
            );
        }

        String strongestTypePhrase = mapLinkTypeToUserFriendlyLabel(evidenceStats.strongestType());

        if (evidenceContribution > 0) {
            boolean recentStrongSignal = evidenceStats.strongestAgeDays() != null
                    && evidenceStats.strongestAgeDays() <= 30
                    && evidenceStats.strongestStrength() != null
                    && evidenceStats.strongestStrength().compareTo(STRONG_SIGNAL_THRESHOLD) >= 0;

            if (recentStrongSignal) {
                return new ClaimReasonComputation(
                        "evidence_boost_recent_strong",
                        "Your recent projects show you're actively using this skill — "
                                + "that's exactly the kind of proof that matters to recruiters. +"
                                + evidenceContribution + " points."
                );
            }

            return new ClaimReasonComputation(
                    "evidence_boost",
                    "We found proof of this skill in your work" +
                            (strongestTypePhrase != null ? " (strongest signal: " + strongestTypePhrase + ")" : "") +
                            ". That added +" + evidenceContribution + " points to your score."
            );
        }

        if (evidenceContribution == 0) {
            return new ClaimReasonComputation(
                    "evidence_neutral",
                    "We found some activity related to this skill, but it wasn't specific enough to move your score yet."
            );
        }

        int absoluteDrop = Math.abs(evidenceContribution);
        boolean mostlyStale = evidenceStats.stale180Count() * 2 >= evidenceLinksUsed;
        boolean strongestIsModerateOrWeak = evidenceStats.strongestStrength() == null
                || evidenceStats.strongestStrength().compareTo(STRONG_SIGNAL_THRESHOLD) < 0;

        if (mostlyStale && strongestIsModerateOrWeak) {
            return new ClaimReasonComputation(
                    "evidence_reduced_stale_and_weak",
                    "The proof we found for this skill is a bit old and indirect. "
                            + "Using it in a more recent project would help push your score back up."
            );
        }

        if (mostlyStale) {
            return new ClaimReasonComputation(
                    "evidence_reduced_stale",
                    "The activity we found for this skill is outdated. "
                            + "More recent work using it would strengthen your score."
            );
        }

        if (strongestIsModerateOrWeak) {
            return new ClaimReasonComputation(
                    "evidence_reduced_strength",
                    "We found some connections, but nothing concrete enough to fully back this up yet. "
                            + "Adding this skill to a project's dependencies or README would make a stronger signal."
            );
        }

        if (finalClaimScore < baselineClaimScore) {
            return new ClaimReasonComputation(
                    "evidence_reduced_mixed",
                    "The signals we found don't clearly confirm this skill. "
                            + "Cleaner, more direct evidence in your projects would improve this score."
            );
        }

        return new ClaimReasonComputation(
                "evidence_neutral",
                "We found some activity related to this skill, but it wasn't specific enough to move your score yet."
        );
    }

    private String mapLinkTypeToUserFriendlyLabel(String linkType) {
        if (linkType == null || linkType.isBlank()) {
            return "repository";
        }

        return switch (linkType) {
            case "dependency_match" -> "dependency usage";
            case "topic_match" -> "repository topic";
            case "name_match" -> "repository name";
            case "description_match" -> "repository description";
            case "language_plus_text_match" -> "language and text";
            default -> "repository";
        };
    }

    private SkillScoreSummary applyPostProcessors(
            SkillScoreSummary deterministicSummary,
            SkillScoreRequest request
    ) {
        SkillScoreSummary current = deterministicSummary;
        for (SkillScorePostProcessor postProcessor : scorePostProcessors) {
            if (postProcessor == null) {
                continue;
            }
            try {
                SkillScoreSummary next = postProcessor.apply(current, request);
                if (next != null) {
                    current = next;
                }
            } catch (Exception exception) {
                System.out.println(String.format(
                        "[POST SCORE] processor=%s failed reason=%s",
                        postProcessor.getClass().getSimpleName(),
                        exception.getMessage()
                ));
            }
        }
        return current;
    }

    // Combines top-K link strengths into one bounded evidence support score.
    private BigDecimal combineEvidenceSignals(List<EvidenceLinkSignal> evidenceLinks) {
        if (evidenceLinks == null || evidenceLinks.isEmpty()) {
            return SkillScoringPolicy.ZERO;
        }

        BigDecimal missProbability = SkillScoringPolicy.ONE;
        for (EvidenceLinkSignal link : evidenceLinks) {
            BigDecimal linkStrength = link == null || link.decayedStrength() == null
                    ? SkillScoringPolicy.ZERO
                    : scoringPolicy.clamp01(link.decayedStrength());
            missProbability = missProbability.multiply(SkillScoringPolicy.ONE.subtract(linkStrength));
        }

        return scoringPolicy.clamp01(SkillScoringPolicy.ONE.subtract(missProbability));
    }

    // Applies mean claim delta to baseline overall score and clamps to [0,100].
    // Denominator is matchedClaims (not totalClaims) because unmatched claims are architecturally
    // excluded from evidence nudges and should not dilute the mean.
    private OverallEvidenceComputation computeEvidenceEnhancedOverallScore(
            int baselineOverallScore,
            List<ClaimScoreComputation> claimComputations,
            int matchedClaims
    ) {
        BigDecimal totalClaimDelta = claimComputations.stream()
                .map(claim -> BigDecimal.valueOf(claim.uncappedEvidenceContribution()))
                .reduce(SkillScoringPolicy.ZERO, BigDecimal::add);
        int denominator = Math.max(1, matchedClaims);
        BigDecimal averageClaimDelta = scoringPolicy.safeDivide(totalClaimDelta, denominator);
        int roundedAverageDelta = averageClaimDelta.setScale(0, RoundingMode.HALF_UP).intValue();
        int overallScore = clampScoreToPercent(baselineOverallScore + roundedAverageDelta);
        return new OverallEvidenceComputation(
                overallScore,
                totalClaimDelta,
                averageClaimDelta,
                roundedAverageDelta
        );
    }

    private int clampScoreToPercent(int score) {
        return Math.max(0, Math.min(100, score));
    }

    private String resolveScoreType(boolean hasParserConfidence, boolean evidenceEnhanced) {
        if (evidenceEnhanced) {
            return hasParserConfidence
                    ? "evidence_enhanced_with_parser_confidence"
                    : "evidence_enhanced";
        }
        return hasParserConfidence
                ? "initial_with_parser_confidence"
                : "initial";
    }

    /**
     * Resolves the deterministic display state for a claim.
     *
     * @param matched whether the claim has canonical resolution
     * @param status normalized persistence status
     * @return display state string
     */
    private String resolveClaimState(boolean matched, String status) {
        if (!matched) {
            return "unresolved_unverified";
        }
        if ("verified".equals(status)) {
            return "recognized_verified";
        }
        return "recognized_unverified";
    }

    /**
     * Builds and globally prioritizes deterministic suggested actions.
     *
     * @param unverifiedClaims scored claims still needing verification work
     * @return sorted action list
     */
    private List<SuggestedAction> buildSuggestedActions(List<SkillClaimScore> unverifiedClaims) {
        List<SuggestedAction> actions = new ArrayList<>();

        for (SkillClaimScore claim : unverifiedClaims) {
            actions.addAll(buildActionsForClaim(claim));
        }

        return actions.stream()
                .sorted(
                        Comparator.comparingInt(SuggestedAction::priority).reversed()
                                .thenComparing(SuggestedAction::action, String.CASE_INSENSITIVE_ORDER)
                )
                .limit(30)
                .toList();
    }

    /**
     * Creates deterministic actions for a single claim.
     *
     * @param claim scored claim
     * @return per-claim action list
     */
    private List<SuggestedAction> buildActionsForClaim(SkillClaimScore claim) {
        List<SuggestedAction> out = new ArrayList<>();

        if (!claim.matched()) {
            out.add(new SuggestedAction(
                    claim.claimId(),
                    "Rename this skill",
                    "We don't recognize this skill name yet. Try a more standard term so we can find matching evidence for it.",
                    100
            ));
        }

        List<String> categoryActions = claim.matched()
                ? actionRuleBook.actionsForCategory(claim.canonicalCategory())
                : actionRuleBook.genericActions();

        int basePriority = computeBasePriority(claim);
        for (int i = 0; i < categoryActions.size(); i++) {
            out.add(new SuggestedAction(
                    claim.claimId(),
                    categoryActions.get(i),
                    claim.matched()
                            ? "This will give us real evidence to back up this skill on your profile."
                            : "Once the skill name is fixed, adding evidence will push your score up.",
                    Math.max(1, basePriority - i)
            ));
        }

        return out;
    }

    /**
     * Computes deterministic per-claim action priority.
     *
     * @param claim scored claim
     * @return integer priority (higher means more urgent)
     */
    private int computeBasePriority(SkillClaimScore claim) {
        if (!claim.matched()) {
            return 90;
        }

        // weightBoost = round(canonicalWeight * 30)
        int weightBoost = claim.canonicalWeight()
                .multiply(new BigDecimal("30"))
                .setScale(0, RoundingMode.HALF_UP)
                .intValue();

        // sourceBoost = round(sourceWeight * 10)
        int sourceBoost = scoringPolicy.sourceWeight(claim.source())
                .multiply(new BigDecimal("10"))
                .setScale(0, RoundingMode.HALF_UP)
                .intValue();

        // basePriority = 50 + weightBoost + sourceBoost
        return 50 + weightBoost + sourceBoost;
    }

    private record ClaimScoreComputation(
            SkillClaimScore score,
            int uncappedEvidenceContribution,
            BigDecimal baselineClaimNormalized
    ) {
    }

    private record EvidenceNudgeComputation(
            BigDecimal effectiveEvidenceStrength,
            BigDecimal support,
            BigDecimal boostProgress,
            BigDecimal headroomNormalized,
            BigDecimal boostNormalized,
            BigDecimal finalClaimNormalized
    ) {
        private static EvidenceNudgeComputation none() {
            return new EvidenceNudgeComputation(
                    SkillScoringPolicy.ZERO,
                    SkillScoringPolicy.ZERO,
                    SkillScoringPolicy.ZERO,
                    SkillScoringPolicy.ZERO,
                    SkillScoringPolicy.ZERO,
                    SkillScoringPolicy.ZERO
            );
        }
    }

    private record ClaimReasonComputation(
            String code,
            String text
    ) {
    }

    private record EvidenceSignalStats(
            int stale180Count,
            int stale365Count,
            BigDecimal strongestStrength,
            BigDecimal weakestStrength,
            String strongestType,
            String weakestType,
            Integer strongestAgeDays,
            Integer weakestAgeDays
    ) {
        private static EvidenceSignalStats empty() {
            return new EvidenceSignalStats(
                    0,
                    0,
                    SkillScoringPolicy.ZERO,
                    SkillScoringPolicy.ZERO,
                    null,
                    null,
                    null,
                    null
            );
        }
    }

    private record OverallEvidenceComputation(
            int overallScore,
            BigDecimal totalClaimDelta,
            BigDecimal averageClaimDelta,
            int roundedAverageDelta
    ) {
    }
}
