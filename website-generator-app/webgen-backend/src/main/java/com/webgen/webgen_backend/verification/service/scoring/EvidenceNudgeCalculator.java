package com.webgen.webgen_backend.verification.service.scoring;

import com.webgen.webgen_backend.verification.service.scoring.model.EvidenceLinkSignal;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillClaimInput;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Deterministic evidence-nudge math: turns a claim's evidence links into a
 * bounded boost toward its score cap, with diminishing returns.
 *
 * <pre>
 * effectiveEvidence = Σ(decayedStrength_i * rankDecay^(i-1))
 * support           = 1 - exp(-gamma * effectiveEvidence)
 * boostProgress     = support^curveExponent
 * headroom          = capNormalized - baselineClaimNormalized
 * final             = baselineClaimNormalized + (headroom * boostProgress)
 * </pre>
 *
 * Design intent:
 * <ul>
 *   <li>Low evidence nudges scores up a little.</li>
 *   <li>More/stronger/fresher evidence increases the nudge.</li>
 *   <li>Diminishing returns prevent linear inflation from many links.</li>
 * </ul>
 */
@Component
@RequiredArgsConstructor
public class EvidenceNudgeCalculator {

    private final SkillScoringPolicy scoringPolicy;
    private final VerificationSignalPolicy verificationSignalPolicy;

    /**
     * Resolves the score ceiling that applies to a claim based on whether it is
     * eligible for the LLM-verified expert tier.
     */
    public int claimScoreCap(SkillClaimInput input) {
        return verificationSignalPolicy.claimScoreCap(strongestReviewConfidence(input));
    }

    /** Returns the strongest reviewed-upload confidence attached to a claim. */
    public BigDecimal strongestReviewConfidence(SkillClaimInput input) {
        if (input == null || input.canonicalSkillId() == null || input.evidenceLinks() == null) {
            return SkillScoringPolicy.ZERO;
        }
        return input.evidenceLinks().stream()
                .filter(link -> link != null && verificationSignalPolicy.isLlmReviewSignal(
                        link.provider(), link.linkType()))
                .map(link -> scoringPolicy.clamp01(link.linkConfidence()))
                .max(BigDecimal::compareTo)
                .orElse(SkillScoringPolicy.ZERO);
    }

    /**
     * Returns true when the claim is canonically matched and has at least one
     * evidence link eligible for reviewed status.
     */
    public boolean isLlmVerified(SkillClaimInput input) {
        if (input == null || input.canonicalSkillId() == null) {
            return false;
        }
        List<EvidenceLinkSignal> evidenceLinks = input.evidenceLinks();
        if (evidenceLinks == null || evidenceLinks.isEmpty()) {
            return false;
        }
        return evidenceLinks.stream().anyMatch(this::isEligibleLlmVerificationSignal);
    }

    /**
     * Computes the deterministic nudge toward the claim cap. Returns
     * {@link EvidenceNudgeComputation#none()} when there is no headroom to grow into.
     *
     * @param evidenceLinks            ranked evidence signals for the claim
     * @param baselineClaimNormalized  pre-evidence normalized prior in [0,1]
     * @param claimScoreCap            integer score ceiling for the claim
     * @return computed nudge with intermediate values for tracing
     */
    public EvidenceNudgeComputation computeNudge(
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

    private boolean isEligibleLlmVerificationSignal(EvidenceLinkSignal link) {
        if (link == null) {
            return false;
        }
        BigDecimal confidence = link.linkConfidence() == null
                ? SkillScoringPolicy.ZERO
                : scoringPolicy.clamp01(link.linkConfidence());
        return verificationSignalPolicy.isEligibleForLlmVerification(
                link.provider(),
                link.linkType(),
                confidence
        );
    }
}
