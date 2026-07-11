package com.webgen.webgen_backend.verification.service.scoring;

import com.webgen.webgen_backend.verification.service.scoring.model.EvidenceLinkSignal;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillClaimInput;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillClaimScore;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillScoreRequest;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillScoreSummary;
import com.webgen.webgen_backend.verification.service.scoring.model.SuggestedAction;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;

/**
 * Orchestrates deterministic skill scoring: assembles per-claim baselines, applies
 * evidence nudges, rolls the results up into an overall score, and delegates the
 * narrative, suggested-action, and evidence-nudge concerns to dedicated
 * collaborators. Math constants live in {@link SkillScoringPolicy}.
 */
@Slf4j
@Component
public class SkillVerificationScoringKernel {

    private final SkillScoringPolicy scoringPolicy;
    private final EvidenceNudgeCalculator evidenceNudgeCalculator;
    private final ClaimScoreNarrator narrator;
    private final SuggestedActionBuilder suggestedActionBuilder;
    private final List<SkillScorePostProcessor> scorePostProcessors;

    public SkillVerificationScoringKernel(
            SkillScoringPolicy scoringPolicy,
            EvidenceNudgeCalculator evidenceNudgeCalculator,
            ClaimScoreNarrator narrator,
            SuggestedActionBuilder suggestedActionBuilder,
            List<SkillScorePostProcessor> scorePostProcessors
    ) {
        this.scoringPolicy = scoringPolicy;
        this.evidenceNudgeCalculator = evidenceNudgeCalculator;
        this.narrator = narrator;
        this.suggestedActionBuilder = suggestedActionBuilder;
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
        List<SkillClaimInput> requestedInputs = request == null || request.claims() == null
                ? List.of()
                : request.claims();
        List<SkillClaimInput> inputs = requestedInputs.stream()
                .filter(input -> input != null
                        && !"rejected".equals(scoringPolicy.normalizeStatus(input.status())))
                .toList();

        BigDecimal requestedParserConfidence = request == null
                ? null
                : request.parserConfidence();
        BigDecimal boundedParserConfidence = requestedParserConfidence == null
                ? null
                : scoringPolicy.clamp01(requestedParserConfidence);

        String scoreType = resolveScoreType(false);

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

        // Baseline overall tracks the neutral baseline over RECOGNIZED skills
        // only, so the profile score reflects the same evidence-aware prior logic
        // users see on claim cards. Unmatched (unrecognized) skills carry no trust
        // signal and can never be improved by evidence, so they are excluded from
        // the average instead of silently dragging it down; they surface separately
        // as rename actions. When nothing is recognized the baseline is 0.
        // claimBaseline_i = 0.50 for every active, recognized claim
        // baseNormalizedScore = average(claimBaseline_i over matched claims)
        BigDecimal matchedClaimPriorSum = claimComputations.stream()
                .filter(c -> c.score().matched())
                .map(ClaimScoreComputation::baselineClaimNormalized)
                .reduce(SkillScoringPolicy.ZERO, BigDecimal::add);
        BigDecimal baseNormalizedScore = scoringPolicy.safeDivide(matchedClaimPriorSum, matchedSkills);

        // Parser confidence is retained as extraction diagnostics only. Evidence
        // and recognized-claim state are the only inputs to verification progress.
        BigDecimal baselineOverallNormalized = baseNormalizedScore;

        int baselineOverallScore = scoringPolicy.toPercent(baselineOverallNormalized);

        boolean hasAnyEvidence = claimScores.stream().anyMatch(claim -> claim.evidenceLinksUsed() > 0);
        scoreType = resolveScoreType(hasAnyEvidence);

        /*
         * Overall evidence adjustment strategy:
         *
         * 1) Keep baseline overall as the anchor so existing no-evidence behavior
         *    stays byte-for-byte compatible.
         * 2) Average the uncapped per-claim evidence contributions over ONLY the
         *    claims that actually have evidence, so skills with no proof yet cannot
         *    dilute the lift earned by skills that do.
         * 3) Re-apply breadth as a damped coverage multiplier (not a divisor), so
         *    backing more of the profile still scores higher without crushing
         *    sparse-but-real evidence toward zero.
         *
         * equation:
         *   meanEvidencedDelta = Σ(claim.uncappedEvidenceContribution) / evidencedClaims
         *   coverage           = evidencedClaims / matchedClaims
         *   overallDelta       = meanEvidencedDelta * coverage^COVERAGE_DAMPING
         *   overall            = clamp_0_100(baselineOverallScore + round(overallDelta))
         */
        OverallEvidenceComputation overallEvidenceComputation = hasAnyEvidence
                ? computeEvidenceEnhancedOverallScore(baselineOverallScore, claimComputations, matchedSkills)
                : new OverallEvidenceComputation(
                        baselineOverallScore,
                        SkillScoringPolicy.ZERO,
                        0,
                        SkillScoringPolicy.ZERO,
                        SkillScoringPolicy.ZERO,
                        SkillScoringPolicy.ZERO,
                        SkillScoringPolicy.ZERO,
                        0
                );
        int overallScore = overallEvidenceComputation.overallScore();
        int evidenceDelta = overallScore - baselineOverallScore;

        log.debug("[BASELINE SCORE] coverage = matched/total = {}/{} = {}",
                matchedSkills, totalSkills, normalizedCoverage);
        log.debug("[BASELINE SCORE] sourceQuality = sourceWeightSum/total = {}/{} = {}",
                sourceWeightSum, totalSkills, sourceQuality);
        log.debug("[BASELINE SCORE] recognizedBaselineAverage = baselineSum/matched = {}/{} = {}",
                matchedClaimPriorSum, matchedSkills, baseNormalizedScore);
        log.debug("[BASELINE SCORE] parserConfidence={} diagnosticOnly=true scoreEffect=0",
                boundedParserConfidence);
        log.debug("[BASELINE SCORE] baselineOverallScore = round(100*{}) = {}",
                baselineOverallNormalized, baselineOverallScore);
        if (hasAnyEvidence) {
            log.debug("[EVIDENCE SCORE] meanEvidencedDelta = totalDelta/evidencedClaims = {}/{} = {}",
                    overallEvidenceComputation.totalClaimDelta(),
                    overallEvidenceComputation.evidencedClaims(),
                    overallEvidenceComputation.meanEvidencedDelta());
            log.debug("[EVIDENCE SCORE] coverage = evidencedClaims/matchedClaims = {}/{} = {} -> dampedCoverage(^{}) = {}",
                    overallEvidenceComputation.evidencedClaims(),
                    matchedSkills,
                    overallEvidenceComputation.coverage(),
                    SkillScoringPolicy.COVERAGE_DAMPING,
                    overallEvidenceComputation.dampedCoverage());
            log.debug("[EVIDENCE SCORE] overallDelta = meanEvidencedDelta*dampedCoverage = {}*{} = {} -> round={}",
                    overallEvidenceComputation.meanEvidencedDelta(),
                    overallEvidenceComputation.dampedCoverage(),
                    overallEvidenceComputation.overallDelta(),
                    overallEvidenceComputation.roundedOverallDelta());
            log.debug("[EVIDENCE SCORE] finalOverallScore = clamp_0_100({} + {}) = {}",
                    baselineOverallScore, overallEvidenceComputation.roundedOverallDelta(), overallScore);
        }
        log.debug("[EVIDENCE SCORE] hasEvidence={} evidenceDelta={} finalOverallScore={} (scoreType={})",
                hasAnyEvidence, evidenceDelta, overallScore, scoreType);

        List<SkillClaimScore> unverifiedClaims = claimScores.stream()
                .filter(c -> !"verified".equals(c.status()))
                .toList();

        List<SuggestedAction> suggestedActions = suggestedActionBuilder.build(unverifiedClaims);

        String profileScoreNarrative = narrator.buildProfileScoreNarrative(
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
     * Scores a single claim with a source-neutral recognition baseline and the
     * evidence nudge supplied by {@link EvidenceNudgeCalculator}.
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

        boolean llmVerified = evidenceNudgeCalculator.isLlmVerified(input);
        int claimScoreCap = evidenceNudgeCalculator.claimScoreCap(llmVerified);
        log.debug("[CLAIM SCORE][LLM] claimId={} llmVerified={} claimScoreCap={}",
                input.claimId(), llmVerified, claimScoreCap);

        // Source provenance is deliberately excluded. Recognition establishes a
        // neutral progress baseline; evidence is responsible for further lift.
        BigDecimal baselineClaimNormalized = matched
                ? SkillScoringPolicy.RECOGNIZED_CLAIM_BASELINE
                : SkillScoringPolicy.ZERO;

        // baselineClaimScore = min(round(100 * baselineClaimNormalized), claimScoreCap)
        int uncappedBaselineClaimScore = scoringPolicy.toPercent(baselineClaimNormalized);
        int baselineClaimScore = Math.min(uncappedBaselineClaimScore, claimScoreCap);

        log.debug("[CLAIM SCORE] claimId={} rawValue={} source={} matched={} status={}",
                input.claimId(), input.rawValue(), source, matched, status);
        log.debug("[CLAIM SCORE] claimId={} baselineNormalized = matched ? {} : 0 = {} -> baselineScore={}",
                input.claimId(), SkillScoringPolicy.RECOGNIZED_CLAIM_BASELINE,
                baselineClaimNormalized, baselineClaimScore);

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
                log.debug("[CLAIM SCORE] claimId={} evidence[{}] type={} rawWeight={} recencyMultiplier={} ageDays={} decayedStrength={}",
                        input.claimId(),
                        i,
                        link == null ? null : link.linkType(),
                        link == null ? null : link.linkTypeWeight(),
                        link == null ? null : link.recencyDecay(),
                        link == null ? null : link.ageDays(),
                        boundedStrength);
            }

            if (matched) {
                evidenceNudge = evidenceNudgeCalculator.computeNudge(evidenceLinks, baselineClaimNormalized, claimScoreCap);
                finalClaimNormalized = evidenceNudge.finalClaimNormalized();
                log.debug("[CLAIM SCORE] claimId={} evidenceNudge effectiveEvidence={} support={} boostProgress={} headroom={} boostNormalized={}",
                        input.claimId(),
                        evidenceNudge.effectiveEvidenceStrength(),
                        evidenceNudge.support(),
                        evidenceNudge.boostProgress(),
                        evidenceNudge.headroomNormalized(),
                        evidenceNudge.boostNormalized());
                log.debug("[CLAIM SCORE] claimId={} finalNormalized = baseline + (headroom*boostProgress) = {} + ({}*{}) = {} -> finalScore pending-cap",
                        input.claimId(),
                        baselineClaimNormalized,
                        evidenceNudge.headroomNormalized(),
                        evidenceNudge.boostProgress(),
                        finalClaimNormalized);
            } else {
                log.debug("[CLAIM SCORE] claimId={} evidence links present but claim is unresolved; skipping evidence nudge until canonical match exists",
                        input.claimId());
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
                ? narrator.collectEvidenceSignalStats(evidenceLinks)
                : EvidenceSignalStats.empty();
        if (evidenceLinksUsedForScoring > 0) {
            log.debug("[CLAIM SCORE] claimId={} finalScore={} baselineScore={} evidenceContribution={} linksUsed={}",
                    input.claimId(),
                    finalClaimScore,
                    baselineClaimScore,
                    evidenceContribution,
                    evidenceLinksUsedForScoring);
            if (evidenceContribution < 0) {
                BigDecimal normalizedGap = finalClaimNormalized.subtract(baselineClaimNormalized);
                BigDecimal weightedGapPoints = normalizedGap.multiply(SkillScoringPolicy.HUNDRED)
                        .setScale(4, RoundingMode.HALF_UP);

                log.debug("[CLAIM SCORE][NEGATIVE] claimId={} reason=evidence_normalized_below_baseline baselineNormalized={} finalNormalized={} normalizedGap={} weightedGapPointsApprox={}",
                        input.claimId(),
                        baselineClaimNormalized,
                        finalClaimNormalized,
                        normalizedGap,
                        weightedGapPoints);
                log.debug("[CLAIM SCORE][NEGATIVE] claimId={} linksUsed={} stale180={} stale365={} strongestSignal=[type={},strength={},ageDays={}] weakestSignal=[type={},strength={},ageDays={}]",
                        input.claimId(),
                        evidenceLinksUsed,
                        evidenceStats.stale180Count(),
                        evidenceStats.stale365Count(),
                        evidenceStats.strongestType(),
                        evidenceStats.strongestStrength(),
                        evidenceStats.strongestAgeDays(),
                        evidenceStats.weakestType(),
                        evidenceStats.weakestStrength(),
                        evidenceStats.weakestAgeDays());
            }
        } else if (evidenceLinksUsed > 0) {
            log.debug("[CLAIM SCORE] claimId={} evidence links ignored for unresolved claim -> finalScore={}",
                    input.claimId(), finalClaimScore);
        }
        if (baselineScoreCapped || finalScoreCapped) {
            log.debug("[CLAIM SCORE][CAP] claimId={} llmVerified={} claimScoreCap={} uncappedBaseline={} baselineScore={} uncappedFinal={} finalScore={} uncappedEvidenceContribution={} displayEvidenceContribution={}",
                    input.claimId(),
                    llmVerified,
                    claimScoreCap,
                    uncappedBaselineClaimScore,
                    baselineClaimScore,
                    uncappedFinalClaimScore,
                    finalClaimScore,
                    uncappedEvidenceContribution,
                    evidenceContribution);
        }

        ClaimReasonComputation claimReason = narrator.buildClaimReason(
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
                log.warn("[POST SCORE] processor={} failed reason={}",
                        postProcessor.getClass().getSimpleName(),
                        exception.getMessage(),
                        exception);
            }
        }
        return current;
    }

    /*
     * Rolls per-claim evidence lifts into one overall delta.
     *
     *   meanEvidencedDelta = Σ uncappedEvidenceContribution / evidencedClaims
     *   coverage           = evidencedClaims / matchedClaims
     *   overallDelta       = meanEvidencedDelta * coverage^COVERAGE_DAMPING
     *   overall            = clamp_0_100(baselineOverallScore + round(overallDelta))
     *
     * Move 1 — divide by evidencedClaims, not all matched claims:
     *   Skills with no evidence yet are simply absent from the average, so they
     *   cannot dilute the lift earned by skills that do have proof.
     *
     * Move 2 — re-apply coverage as a damped multiplier, not a divisor:
     *   Breadth still counts (backing more of the profile scores strictly higher),
     *   but raising coverage to COVERAGE_DAMPING (< 1) stops sparse-but-real
     *   evidence from being crushed toward zero. At COVERAGE_DAMPING = 1.0 this is
     *   identical to the previous mean-over-all-matched behavior.
     *
     * Sign note: damping is symmetric, so when evidence is net-negative (stale /
     * indirect signals) a sparse profile is pulled down a little more sharply than
     * before. This preserves the existing "evidence can lower the score" behavior
     * and its narrative; floor overallDelta at 0 here if that should change.
     */
    private OverallEvidenceComputation computeEvidenceEnhancedOverallScore(
            int baselineOverallScore,
            List<ClaimScoreComputation> claimComputations,
            int matchedClaims
    ) {
        BigDecimal totalClaimDelta = claimComputations.stream()
                .map(claim -> BigDecimal.valueOf(claim.uncappedEvidenceContribution()))
                .reduce(SkillScoringPolicy.ZERO, BigDecimal::add);

        int evidencedClaims = (int) claimComputations.stream()
                .filter(claim -> claim.score().evidenceLinksUsed() > 0)
                .count();

        if (evidencedClaims <= 0) {
            return new OverallEvidenceComputation(
                    baselineOverallScore,
                    totalClaimDelta,
                    0,
                    SkillScoringPolicy.ZERO,
                    SkillScoringPolicy.ZERO,
                    SkillScoringPolicy.ZERO,
                    SkillScoringPolicy.ZERO,
                    0
            );
        }

        // Move 1: average only over claims that actually have evidence.
        BigDecimal meanEvidencedDelta = scoringPolicy.safeDivide(totalClaimDelta, evidencedClaims);

        // Move 2: re-introduce breadth as a damped multiplier, not a divisor.
        BigDecimal coverage = scoringPolicy.safeDivide(
                BigDecimal.valueOf(evidencedClaims),
                Math.max(1, matchedClaims)
        );
        BigDecimal dampedCoverage = dampCoverage(coverage);

        BigDecimal overallDelta = meanEvidencedDelta.multiply(dampedCoverage);
        int roundedOverallDelta = overallDelta.setScale(0, RoundingMode.HALF_UP).intValue();
        int overallScore = clampScoreToPercent(baselineOverallScore + roundedOverallDelta);

        return new OverallEvidenceComputation(
                overallScore,
                totalClaimDelta,
                evidencedClaims,
                meanEvidencedDelta,
                coverage,
                dampedCoverage,
                overallDelta,
                roundedOverallDelta
        );
    }

    // Softens coverage so low coverage trims (not crushes) the evidence lift.
    private BigDecimal dampCoverage(BigDecimal coverage) {
        BigDecimal bounded = scoringPolicy.clamp01(coverage);
        if (bounded.compareTo(SkillScoringPolicy.ZERO) <= 0) {
            return SkillScoringPolicy.ZERO;
        }
        double damped = Math.pow(bounded.doubleValue(), SkillScoringPolicy.COVERAGE_DAMPING.doubleValue());
        return scoringPolicy.clamp01(BigDecimal.valueOf(damped));
    }

    private int clampScoreToPercent(int score) {
        return Math.max(0, Math.min(100, score));
    }

    private String resolveScoreType(boolean evidenceEnhanced) {
        return evidenceEnhanced ? "evidence_enhanced" : "initial";
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

    private record ClaimScoreComputation(
            SkillClaimScore score,
            int uncappedEvidenceContribution,
            BigDecimal baselineClaimNormalized
    ) {
    }

    private record OverallEvidenceComputation(
            int overallScore,
            BigDecimal totalClaimDelta,
            int evidencedClaims,
            BigDecimal meanEvidencedDelta,
            BigDecimal coverage,
            BigDecimal dampedCoverage,
            BigDecimal overallDelta,
            int roundedOverallDelta
    ) {
    }
}
