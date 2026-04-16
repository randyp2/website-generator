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
 * coverage      = matchedSkills / totalSkills
 * sourceQuality = average(sourceWeight per claim)
 * base          = 0.70 * coverage + 0.30 * sourceQuality
 *
 * // optional parser-confidence blend when confidence exists
 * finalNormalized = 0.90 * base + 0.10 * parserConfidence
 *
 * overallScore = round(finalNormalized * 100)
 * </pre>
 *
 * <p>Phase 7 evidence blend (when evidence exists for a claim):</p>
 *
 * <pre>
 * finalClaimNormalized =
 *     0.40 * baselineClaimNormalized
 *   + 0.60 * evidenceClaimNormalized
 * </pre>
 *
 * <p>Per-claim score formula:</p>
 *
 * <pre>
 * claimScore = round(100 * (0.70 * isCanonicalMatched + 0.30 * sourceWeight))
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
     * Baseline keeps minority influence once external evidence is present so
     * canonical/source priors still matter, but no longer dominate.
     */
    public static final BigDecimal EVIDENCE_BLEND_BASELINE_WEIGHT = new BigDecimal("0.40");

    /**
     * Evidence receives majority influence to avoid overstating confidence from
     * claim extraction alone.
     */
    public static final BigDecimal EVIDENCE_BLEND_EVIDENCE_WEIGHT = new BigDecimal("0.60");

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
