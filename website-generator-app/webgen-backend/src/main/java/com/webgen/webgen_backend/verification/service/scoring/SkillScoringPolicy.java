package com.webgen.webgen_backend.verification.service.scoring;

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
 * claimBaseline_i = 0.00 for every active claim
 * base            = average(claimBaseline_i over recognized claims)
 * baselineOverallScore = round(base * 100)
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
 * <p>Per-claim baseline formula (before evidence nudge):</p>
 *
 * <pre>
 * claimBaseline = 0.00
 *
 * Canonical recognition controls whether evidence can be scored. Recognition
 * alone does not award verification points.
 * </pre>
 */
@Component
public class SkillScoringPolicy {

    /** Shared math constants for deterministic score computation. */
    public static final BigDecimal ZERO = BigDecimal.ZERO;
    public static final BigDecimal ONE = BigDecimal.ONE;
    public static final BigDecimal HUNDRED = new BigDecimal("100");

    /** Evidence-free claims receive no verification points. */
    public static final BigDecimal VERIFICATION_SCORE_BASELINE = ZERO;

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
    public static final BigDecimal EVIDENCE_SUPPORT_GROWTH_GAMMA = new BigDecimal("3.50");

    /**
     * Boost curve exponent in:
     *
     * boostProgress = support^curveExponent
     *
     * The exponent creates a deliberate separation between weak proximity and
     * direct proof. Paired with the faster support growth, an untouched fork
     * remains below Basic while a fresh repository with confirmed direct
     * authorship can reach Advanced from the zero baseline.
     */
    public static final BigDecimal EVIDENCE_BOOST_CURVE_EXPONENT = new BigDecimal("2.80");

    /**
     * Damping exponent applied to evidence coverage when rolling per-claim
     * evidence scores into one overall score:
     *
     * overallScore = meanEvidencedScore * coverage^COVERAGE_DAMPING
     *
     * where coverage = evidencedClaims / matchedClaims.
     *
     * Why this exists:
     * - The overall score is first averaged over only the claims that actually
     *   have evidence (so empty skills cannot dilute it), then breadth is
     *   re-applied as this damped multiplier instead of a raw divisor.
     *
     * Behavior at the extremes:
     * - 1.00 reproduces a mean over all matched claims, where sparse evidence is
     *   reduced in direct proportion to unsupported claims.
     * - 0.00 ignores breadth entirely, so proving one skill lifts the overall
     *   score as much as proving every skill (over-rewarding, gameable).
     * - 0.60 (current) keeps breadth meaningful while letting concentrated, genuine
     *   evidence register a visible lift. It also keeps one evidenced claim mixed
     *   with ten unsupported claims below the Basic threshold.
     */
    public static final BigDecimal COVERAGE_DAMPING = new BigDecimal("0.60");

    /** Scale used for division to keep deterministic rounding behavior stable. */
    public static final int DIV_SCALE = 6;

    /** Neutral fallback when an unknown source value is encountered. */
    public static final BigDecimal DEFAULT_SOURCE_WEIGHT = new BigDecimal("0.50");

    /**
     * Informational source-quality priors retained for the sourceQuality metric
     * and action ordering. They do not affect claim or overall score baselines.
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
            case "pending", "user_confirmed", "rejected", "needs_evidence", "corroborated", "verified" -> normalized;
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
