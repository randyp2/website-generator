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

@Component
public class SkillVerificationScoringKernel {

    private final SkillScoringPolicy scoringPolicy;
    private final SkillSuggestedActionRuleBook actionRuleBook;
    private final List<SkillScorePostProcessor> scorePostProcessors;
    private static final int STALE_SIGNAL_DAYS_THRESHOLD = 180;
    private static final BigDecimal STRONG_SIGNAL_THRESHOLD = new BigDecimal("0.80");

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
                ? computeEvidenceEnhancedOverallScore(baselineOverallScore, claimComputations)
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
                    "[EVIDENCE SCORE] meanClaimDelta = totalClaimDelta/claimCount = %s/%d = %s",
                    overallEvidenceComputation.totalClaimDelta(),
                    claimComputations.size(),
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
                    "Expert-level scores are reserved for LLM verification. This claim is currently capped at "
                            + claimScoreCap + "."
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
        return false;
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
                        "Recognized from your resume, but no linked project signals yet, so the score stays at baseline."
                );
            }
            return new ClaimReasonComputation(
                    "no_match_no_evidence",
                    "This claim is not yet recognized and has no linked project signals to support it."
            );
        }

        String linkCountPhrase = evidenceLinksUsed + " linked signal" + (evidenceLinksUsed == 1 ? "" : "s");
        String strongestTypePhrase = mapLinkTypeToUserFriendlyLabel(evidenceStats.strongestType());

        if (evidenceContribution > 0) {
            boolean recentStrongSignal = evidenceStats.strongestAgeDays() != null
                    && evidenceStats.strongestAgeDays() <= 30
                    && evidenceStats.strongestStrength() != null
                    && evidenceStats.strongestStrength().compareTo(STRONG_SIGNAL_THRESHOLD) >= 0;

            if (recentStrongSignal) {
                return new ClaimReasonComputation(
                        "evidence_boost_recent_strong",
                        "Recent strong " + strongestTypePhrase + " evidence increased this score by "
                                + evidenceContribution + " points (" + linkCountPhrase + ")."
                );
            }

            return new ClaimReasonComputation(
                    "evidence_boost",
                    "Linked evidence increased this score by " + evidenceContribution
                            + " points, led by " + strongestTypePhrase + " signals."
            );
        }

        if (evidenceContribution == 0) {
            return new ClaimReasonComputation(
                    "evidence_neutral",
                    "Linked evidence roughly confirmed the baseline score with no material change."
            );
        }

        int absoluteDrop = Math.abs(evidenceContribution);
        boolean mostlyStale = evidenceStats.stale180Count() * 2 >= evidenceLinksUsed;
        boolean strongestIsModerateOrWeak = evidenceStats.strongestStrength() == null
                || evidenceStats.strongestStrength().compareTo(STRONG_SIGNAL_THRESHOLD) < 0;

        if (mostlyStale && strongestIsModerateOrWeak) {
            return new ClaimReasonComputation(
                    "evidence_reduced_stale_and_weak",
                    "Most linked evidence is older and moderate-strength, so the score dropped "
                            + absoluteDrop + " points from baseline."
            );
        }

        if (mostlyStale) {
            return new ClaimReasonComputation(
                    "evidence_reduced_stale",
                    "Most linked evidence is older, which lowered confidence and reduced this score by "
                            + absoluteDrop + " points."
            );
        }

        if (strongestIsModerateOrWeak) {
            return new ClaimReasonComputation(
                    "evidence_reduced_strength",
                    "Evidence is linked, but the current signals are not strong enough yet, so the score is "
                            + absoluteDrop + " points below baseline."
            );
        }

        if (finalClaimScore < baselineClaimScore) {
            return new ClaimReasonComputation(
                    "evidence_reduced_mixed",
                    "Linked evidence is mixed and currently below baseline confidence, reducing this score by "
                            + absoluteDrop + " points."
            );
        }

        return new ClaimReasonComputation(
                "evidence_neutral",
                "Linked evidence roughly confirmed the baseline score with no material change."
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
    private OverallEvidenceComputation computeEvidenceEnhancedOverallScore(
            int baselineOverallScore,
            List<ClaimScoreComputation> claimComputations
    ) {
        BigDecimal totalClaimDelta = claimComputations.stream()
                .map(claim -> BigDecimal.valueOf(claim.uncappedEvidenceContribution()))
                .reduce(SkillScoringPolicy.ZERO, BigDecimal::add);
        BigDecimal averageClaimDelta = scoringPolicy.safeDivide(totalClaimDelta, claimComputations.size());
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
                    "Review/Rename claim",
                    "No canonical match found. Normalize claim wording first.",
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
                            ? "Rule-based next step for this skill category."
                            : "Provide supporting evidence after claim normalization.",
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
