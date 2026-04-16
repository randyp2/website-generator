package com.webgen.webgen_backend.resume_verification_service.scoring;

import com.webgen.webgen_backend.resume_verification_service.scoring.model.EvidenceLinkSignal;
import com.webgen.webgen_backend.resume_verification_service.scoring.model.SkillClaimInput;
import com.webgen.webgen_backend.resume_verification_service.scoring.model.SkillClaimScore;
import com.webgen.webgen_backend.resume_verification_service.scoring.model.SkillScoreRequest;
import com.webgen.webgen_backend.resume_verification_service.scoring.model.SkillScoreSummary;
import com.webgen.webgen_backend.resume_verification_service.scoring.model.SuggestedAction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SkillVerificationScoringKernel {

    private final SkillScoringPolicy scoringPolicy;
    private final SkillSuggestedActionRuleBook actionRuleBook;

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

        // baseNormalizedScore =
        //   (normalizedCoverage * COVERAGE_WEIGHT)
        // + (sourceQuality      * SOURCE_QUALITY_WEIGHT)
        BigDecimal baseNormalizedScore = normalizedCoverage.multiply(SkillScoringPolicy.COVERAGE_WEIGHT)
                .add(sourceQuality.multiply(SkillScoringPolicy.SOURCE_QUALITY_WEIGHT));

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
         * 2) Compute mean per-claim evidence contribution in percentage points.
         * 3) Apply the rounded mean delta once at overall level.
         *
         * equation:
         *   meanClaimDelta = average(claim.evidenceContribution)
         *   overall        = clamp_0_100(baselineOverallScore + round(meanClaimDelta))
         *
         * Why mean (not sum):
         * - Sum would scale with claim count and over-amplify profiles that simply
         *   have many extracted claims.
         * - Mean keeps adjustments comparable across profiles of different sizes.
         */
        int overallScore = hasAnyEvidence
                ? computeEvidenceEnhancedOverallScore(baselineOverallScore, claimScores)
                : baselineOverallScore;
        int evidenceDelta = overallScore - baselineOverallScore;

        System.out.println(
                "[BASELINE SCORE] Formula computes initial trust score from canonical coverage and source reliability. "
                        + "base = 0.70*coverage + 0.30*sourceQuality"
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
                "[BASELINE SCORE] baseNormalized = (0.70*%s) + (0.30*%s) = %s",
                normalizedCoverage,
                sourceQuality,
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

        return new SkillScoreSummary(
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

        BigDecimal sourceWeight = scoringPolicy.sourceWeight(source);
        BigDecimal matchValue = matched ? SkillScoringPolicy.ONE : SkillScoringPolicy.ZERO;

        // claimNormalized =
        //   (matchValue   * COVERAGE_WEIGHT)
        // + (sourceWeight * SOURCE_QUALITY_WEIGHT)
        BigDecimal baselineClaimNormalized = matchValue.multiply(SkillScoringPolicy.COVERAGE_WEIGHT)
                .add(sourceWeight.multiply(SkillScoringPolicy.SOURCE_QUALITY_WEIGHT));

        // baselineClaimScore = round(100 * baselineClaimNormalized)
        int baselineClaimScore = scoringPolicy.toPercent(baselineClaimNormalized);

        String state = resolveClaimState(matched, status);

        BigDecimal canonicalWeight = input.canonicalWeight() == null
                ? SkillScoringPolicy.ZERO
                : scoringPolicy.clamp01(input.canonicalWeight());

        List<EvidenceLinkSignal> evidenceLinks = input.evidenceLinks() == null
                ? List.of()
                : input.evidenceLinks();
        int evidenceLinksUsed = evidenceLinks.size();

        BigDecimal finalClaimNormalized = baselineClaimNormalized;
        if (evidenceLinksUsed > 0) {
            /*
             * Per-claim evidence aggregation:
             *
             * evidenceClaimNormalized = 1 - Π(1 - linkStrength_i)
             *
             * where:
             *   linkStrength_i = decayedStrength_i in [0,1]
             *
             * Why this equation:
             * - Monotonic: adding evidence can never reduce support.
             * - Bounded: result always remains in [0,1].
             * - Diminishing returns: repeated similar links contribute less, which
             *   naturally dampens repository spam effects without hard cliffs.
             */
            BigDecimal evidenceClaimNormalized = combineEvidenceSignals(evidenceLinks);

            /*
             * Evidence blend contract (locked in Phase 7 step 1):
             *
             * finalClaimNormalized =
             *     0.40 * baselineClaimNormalized
             *   + 0.60 * evidenceClaimNormalized
             *
             * Design intent:
             * - Baseline reflects extraction/canonical priors, not proof.
             * - Evidence receives majority influence once present.
             */
            finalClaimNormalized = baselineClaimNormalized
                    .multiply(SkillScoringPolicy.EVIDENCE_BLEND_BASELINE_WEIGHT)
                    .add(evidenceClaimNormalized.multiply(SkillScoringPolicy.EVIDENCE_BLEND_EVIDENCE_WEIGHT));
        }
        finalClaimNormalized = scoringPolicy.clamp01(finalClaimNormalized);

        int finalClaimScore = scoringPolicy.toPercent(finalClaimNormalized);
        int evidenceContribution = evidenceLinksUsed > 0
                ? finalClaimScore - baselineClaimScore
                : 0;

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
                evidenceLinksUsed,
                finalClaimScore
        );

        return new ClaimScoreComputation(score);
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
    private int computeEvidenceEnhancedOverallScore(int baselineOverallScore, List<SkillClaimScore> claimScores) {
        BigDecimal totalClaimDelta = claimScores.stream()
                .map(claim -> BigDecimal.valueOf(claim.evidenceContribution()))
                .reduce(SkillScoringPolicy.ZERO, BigDecimal::add);
        BigDecimal averageClaimDelta = scoringPolicy.safeDivide(totalClaimDelta, claimScores.size());
        int roundedAverageDelta = averageClaimDelta.setScale(0, RoundingMode.HALF_UP).intValue();
        return clampScoreToPercent(baselineOverallScore + roundedAverageDelta);
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
            SkillClaimScore score
    ) {
    }
}
