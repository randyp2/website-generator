package com.webgen.webgen_backend.verification.service.provider.github;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Converts shared source content into gradual credit for meaningful novelty. */
@Component
public class GithubRepositoryNoveltyPolicy {

    public static final double DERIVATIVE_SIMILARITY_THRESHOLD = 0.60d;
    public static final double DUPLICATE_SIMILARITY_THRESHOLD = 0.90d;
    public static final BigDecimal MINIMUM_DERIVATIVE_CREDIT = new BigDecimal("0.25");
    public static final BigDecimal MAXIMUM_LINEAGE_CREDIT = new BigDecimal("0.85");
    private static final BigDecimal FULL_CREDIT = BigDecimal.ONE;
    private static final int WEIGHT_SCALE = 4;

    /**
     * Gives full credit below the derivative threshold, then decreases linearly
     * toward a non-zero floor so meaningful quantity continues to count.
     */
    public BigDecimal independenceWeight(double sharedContentEstimate) {
        double boundedSimilarity = Math.max(0.0d, Math.min(1.0d, sharedContentEstimate));
        if (boundedSimilarity <= DERIVATIVE_SIMILARITY_THRESHOLD) {
            return FULL_CREDIT.setScale(WEIGHT_SCALE, RoundingMode.HALF_UP);
        }

        double range = DUPLICATE_SIMILARITY_THRESHOLD - DERIVATIVE_SIMILARITY_THRESHOLD;
        double remainingNovelty = Math.max(0.0d,
                DUPLICATE_SIMILARITY_THRESHOLD - boundedSimilarity) / range;
        BigDecimal variableCredit = FULL_CREDIT
                .subtract(MINIMUM_DERIVATIVE_CREDIT)
                .multiply(BigDecimal.valueOf(remainingNovelty));
        return MINIMUM_DERIVATIVE_CREDIT
                .add(variableCredit)
                .setScale(WEIGHT_SCALE, RoundingMode.HALF_UP);
    }

    /**
     * Keeps resolved lineage as a conservative correlation prior while allowing
     * meaningfully diverged forks to contribute substantial independent evidence.
     */
    public BigDecimal lineageIndependenceWeight(double sharedContentEstimate) {
        return independenceWeight(sharedContentEstimate)
                .min(MAXIMUM_LINEAGE_CREDIT)
                .setScale(WEIGHT_SCALE, RoundingMode.HALF_UP);
    }
}
