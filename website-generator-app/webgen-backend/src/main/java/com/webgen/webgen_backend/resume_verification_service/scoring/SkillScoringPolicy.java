package com.webgen.webgen_backend.resume_verification_service.scoring;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Locale;
import java.util.Map;

/**
 * Central policy constants and math helpers for Phase 4 deterministic skill scoring.
 *
 * <p>Overall score formula:</p>
 *
 * <pre>
 * claimPrior_i  = 0.70 * matchValue_i + 0.30 * sourceWeight_i
 * base          = average(claimPrior_i)
 *
 * // optional parser-confidence blend when confidence exists
 * finalNormalized = 0.90 * base + 0.10 * parserConfidence
 *
 * baselineOverallScore = round(finalNormalized * 100)
 * </pre>
 *
 * <p>Phase 7 evidence nudge model (when evidence exists for a matched claim):</p>
 *
 * <pre>
 * effectiveEvidence = Σ(decayedStrength_i * rankDecay^(i-1))
 * support           = 1 - exp(-gamma * effectiveEvidence)
 * boostProgress     = support^curveExponent
 * headroom          = claimCapNormalized - baselineClaimNormalized
 * finalClaim        = baselineClaimNormalized + (headroom * boostProgress)
 * </pre>
 *
 * <p>Per-claim prior formula (before evidence nudge):</p>
 *
 * <pre>
 * matchValue =
 *   0.00 when unmatched
 *   0.35 when matched but no linked evidence
 *
 * claimPrior = 0.70 * matchValue + 0.30 * sourceWeight
 * </pre>
 */
@Component
public class SkillScoringPolicy {

    /** Shared math constants for deterministic score computation. */
    public static final BigDecimal ZERO = BigDecimal.ZERO;
    public static final BigDecimal ONE = BigDecimal.ONE;
    public static final BigDecimal HUNDRED = new BigDecimal("100");

    /** Coverage drives 70% of the score because canonical matching is the primary signal. */
    public static final BigDecimal COVERAGE_WEIGHT = new BigDecimal("0.70");

    /** Source quality drives the remaining 30% to reward stronger claim origins. */
    public static final BigDecimal SOURCE_QUALITY_WEIGHT = new BigDecimal("0.30");

    /** Base deterministic score retains 90% influence when parser confidence is blended. */
    public static final BigDecimal BASE_WITH_PARSER_WEIGHT = new BigDecimal("0.90");

    /** Parser confidence contributes 10% as a small quality nudge, not a dominant signal. */
    public static final BigDecimal PARSER_CONFIDENCE_WEIGHT = new BigDecimal("0.10");

    /**
     * Canonical-matched claims without linked evidence keep reduced prior value.
     * This avoids treating extraction/canonical mapping as proof before accounts
     * are connected.
     */
    public static final BigDecimal MATCHED_WITHOUT_EVIDENCE_VALUE = new BigDecimal("0.35");

    /**
     * Additional evidence links are down-weighted geometrically by rank:
     *
     * rankWeight(i) = rankDecay^(i-1)
     *
     * with i=1 for the strongest link after deterministic sort.
     *
     * Decision rationale:
     * - first link has full weight (1.0),
     * - subsequent links still add value,
     * - repeated links have diminishing marginal impact.
     */
    public static final BigDecimal EVIDENCE_FREQUENCY_RANK_DECAY = new BigDecimal("0.75");

    /**
     * Evidence-support growth rate in:
     *
     * support = 1 - exp(-gamma * effectiveEvidence)
     *
     * Larger gamma reaches high support sooner; smaller gamma requires more
     * accumulated evidence strength to approach full support.
     */
    public static final BigDecimal EVIDENCE_SUPPORT_GROWTH_GAMMA = new BigDecimal("0.70");

    /**
     * Boost curve exponent in:
     *
     * boostProgress = support^curveExponent
     *
     * curveExponent > 1 delays large boosts until evidence support is stronger,
     * so weak evidence only nudges scores up a little.
     */
    public static final BigDecimal EVIDENCE_BOOST_CURVE_EXPONENT = new BigDecimal("1.35");

    /**
     * Pre-LLM hard ceiling for claim scores.
     * Expert tier (81-100) is reserved for future LLM-backed verification.
     */
    public static final int MAX_CLAIM_SCORE_WITHOUT_LLM = 80;

    /** Upper bound when LLM verification is available for a claim. */
    public static final int MAX_CLAIM_SCORE_WITH_LLM = 100;

    /** Scale used for division to keep deterministic rounding behavior stable. */
    public static final int DIV_SCALE = 6;

    /** Neutral fallback when an unknown source value is encountered. */
    public static final BigDecimal DEFAULT_SOURCE_WEIGHT = new BigDecimal("0.50");

    /**
     * Fixed source trust priors for the initial deterministic phase.
     *
     * <p>These weights represent initial confidence in claim origin before any external evidence checks.</p>
     */
    public static final Map<String, BigDecimal> SOURCE_WEIGHTS = Map.of(
            "resume", new BigDecimal("0.80"),
            "manual", new BigDecimal("0.50"),
            "imported", new BigDecimal("0.90")
    );

    /**
     * Resolves source-weight fallback behavior for unknown sources.
     *
     * @param source normalized claim source
     * @return source weight in [0, 1]
     */
    public BigDecimal sourceWeight(String source) {
        return SOURCE_WEIGHTS.getOrDefault(source, DEFAULT_SOURCE_WEIGHT);
    }

    /**
     * Clamps a decimal value into the inclusive [0, 1] range.
     *
     * @param value raw decimal input
     * @return bounded decimal between 0 and 1
     */
    public BigDecimal clamp01(BigDecimal value) {
        if (value == null) {
            return ZERO;
        }
        if (value.compareTo(ZERO) < 0) {
            return ZERO;
        }
        if (value.compareTo(ONE) > 0) {
            return ONE;
        }
        return value;
    }

    /**
     * Safely divides a numerator by an integer denominator using deterministic rounding.
     *
     * @param numerator numerator value
     * @param denominator denominator value
     * @return divided value, or 0 when denominator is not positive
     */
    public BigDecimal safeDivide(BigDecimal numerator, int denominator) {
        if (denominator <= 0) {
            return ZERO;
        }
        return numerator.divide(BigDecimal.valueOf(denominator), DIV_SCALE, RoundingMode.HALF_UP);
    }

    /**
     * Converts a normalized value into a bounded integer score from 0 to 100.
     *
     * @param normalized decimal score in normalized space
     * @return rounded integer percentage
     */
    public int toPercent(BigDecimal normalized) {
        BigDecimal bounded = clamp01(normalized);
        int score = bounded.multiply(HUNDRED).setScale(0, RoundingMode.HALF_UP).intValue();
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Normalizes a source string into a supported value for policy lookup.
     *
     * @param source raw source input
     * @return supported source key
     */
    public String normalizeSource(String source) {
        if (source == null || source.isBlank()) {
            return "manual";
        }

        String normalized = source.trim().toLowerCase(Locale.ROOT);
        return SOURCE_WEIGHTS.containsKey(normalized) ? normalized : "manual";
    }

    /**
     * Normalizes persisted claim status into known workflow states.
     *
     * @param status raw status input
     * @return supported status key
     */
    public String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "pending";
        }

        String normalized = status.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "pending", "user_confirmed", "rejected", "needs_evidence", "verified" -> normalized;
            default -> "pending";
        };
    }

    /**
     * Normalizes canonical category keys for deterministic rule lookup.
     *
     * @param category raw category string
     * @return normalized category key
     */
    public String normalizeCategory(String category) {
        if (category == null || category.isBlank()) {
            return "general";
        }

        return category.trim().toLowerCase(Locale.ROOT).replace('-', '_');
    }
}
