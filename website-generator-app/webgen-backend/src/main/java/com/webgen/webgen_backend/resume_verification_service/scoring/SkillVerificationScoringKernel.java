package com.webgen.webgen_backend.resume_verification_service.scoring;

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

        BigDecimal parserConfidence = request == null
                ? null
                : request.parserConfidence();

        String scoreType = parserConfidence == null
                ? "initial"
                : "initial_with_parser_confidence";

        if (inputs.isEmpty()) {
            return new SkillScoreSummary(
                    scoreType,
                    0,
                    0,
                    0,
                    0,
                    SkillScoringPolicy.ZERO,
                    SkillScoringPolicy.ZERO,
                    parserConfidence,
                    List.of(),
                    List.of(),
                    List.of()
            );
        }

        // Map SkillClaimInput to SkillClaimScore to feed into our scoring kernel
        List<SkillClaimScore> claimScores = inputs.stream()
                .map(this::scoreClaim)
                .sorted(
                        Comparator.comparingInt(SkillClaimScore::claimScore).reversed()
                                .thenComparing(c -> c.rawValue() == null ? "" : c.rawValue(), String.CASE_INSENSITIVE_ORDER)
                )
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

        // baseNormalizedScore =
        //   (normalizedCoverage * COVERAGE_WEIGHT)
        // + (sourceQuality      * SOURCE_QUALITY_WEIGHT)
        BigDecimal normalizedScore = baseNormalizedScore;

        BigDecimal boundedParserConfidence = null;
        if (parserConfidence != null) {
            boundedParserConfidence = scoringPolicy.clamp01(parserConfidence);
            // finalNormalizedScore =
            //   (baseNormalizedScore * BASE_WITH_PARSER_WEIGHT)
            // + (parserConfidence    * PARSER_CONFIDENCE_WEIGHT)
            normalizedScore = normalizedScore.multiply(SkillScoringPolicy.BASE_WITH_PARSER_WEIGHT)
                    .add(boundedParserConfidence.multiply(SkillScoringPolicy.PARSER_CONFIDENCE_WEIGHT));
        }

        // overallScore = round(finalNormalizedScore * 100)
        int overallScore = scoringPolicy.toPercent(normalizedScore);

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
                    normalizedScore
            ));
        }
        System.out.println(String.format(
                "[BASELINE SCORE] overallScore = round(100*%s) = %d (scoreType=%s)",
                normalizedScore,
                overallScore,
                scoreType
        ));

        List<SkillClaimScore> unverifiedClaims = claimScores.stream()
                .filter(c -> !"verified".equals(c.status()))
                .toList();

        List<SuggestedAction> suggestedActions = buildSuggestedActions(unverifiedClaims);

        return new SkillScoreSummary(
                scoreType,
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
    private SkillClaimScore scoreClaim(SkillClaimInput input) {
        String source = scoringPolicy.normalizeSource(input.source());
        String status = scoringPolicy.normalizeStatus(input.status());
        String category = scoringPolicy.normalizeCategory(input.canonicalCategory());

        boolean matched = input.canonicalSkillId() != null;

        BigDecimal sourceWeight = scoringPolicy.sourceWeight(source);
        BigDecimal matchValue = matched ? SkillScoringPolicy.ONE : SkillScoringPolicy.ZERO;

        // claimNormalized =
        //   (matchValue   * COVERAGE_WEIGHT)
        // + (sourceWeight * SOURCE_QUALITY_WEIGHT)
        BigDecimal claimNormalized = matchValue.multiply(SkillScoringPolicy.COVERAGE_WEIGHT)
                .add(sourceWeight.multiply(SkillScoringPolicy.SOURCE_QUALITY_WEIGHT));

        // claimScore = round(claimNormalized * 100)
        int claimScore = scoringPolicy.toPercent(claimNormalized);

        String state = resolveClaimState(matched, status);

        BigDecimal canonicalWeight = input.canonicalWeight() == null
                ? SkillScoringPolicy.ZERO
                : scoringPolicy.clamp01(input.canonicalWeight());

        return new SkillClaimScore(
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
                claimScore
        );
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
}
