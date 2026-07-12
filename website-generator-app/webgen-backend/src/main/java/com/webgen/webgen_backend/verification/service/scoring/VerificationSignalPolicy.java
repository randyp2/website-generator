package com.webgen.webgen_backend.verification.service.scoring;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Locale;
import java.util.Map;

/**
 * Single source of truth for how much to trust each type of evidence signal,
 * and what it takes for an AI-analyzed upload to unlock higher score tiers.
 *
 * Previously, link type weights lived in the assembler and LLM verification
 * rules lived in the scoring kernel. That worked fine with two providers, but
 * adding a new integration (LinkedIn, Dribbble, Behance, etc.) meant hunting
 * across both files to register the same concept. Everything that answers
 * "what is this signal worth?" now lives here.
 *
 * Two questions this class answers:
 *   1. How much should we trust a particular type of evidence link?
 *   2. Has the AI reviewed an upload well enough to unlock the expert score tier?
 */
@Component
public class VerificationSignalPolicy {

    /**
     * Fallback weight for link types we haven't calibrated yet.
     *
     * When a new integration produces a link type we don't recognize, we give
     * it a neutral 0.50 rather than letting it fail silently or accidentally
     * get full trust. This means a future GitLab connector, for example, won't
     * get penalized to zero or inflated to full weight before we've deliberately
     * decided what its signals are worth.
     */
    private static final BigDecimal DEFAULT_LINK_TYPE_WEIGHT = new BigDecimal("0.50");

    /**
     * How much to trust each link type when calculating evidence strength.
     *
     * These weights appear in the decayed-strength formula:
     *
     *   decayedStrength = scoringStrength × linkTypeWeight × recencyDecay
     *
     * scoringStrength is connector match confidence or reviewed evidence depth.
     * linkTypeWeight is how much that type of sighting actually proves usage.
     * recencyDecay discounts older evidence over time.
     *
     * So a weight of 1.00 means we trust the evidence at full face value.
     * A weight of 0.48 means the same confidence score counts for roughly
     * half as much — because that type of signal is a weaker form of proof.
     *
     * Weights run strongest to weakest, reflecting how directly each type
     * proves someone actively used the skill versus just being in its vicinity.
     */
    private static final Map<String, BigDecimal> LINK_TYPE_WEIGHTS = Map.ofEntries(

            /*
             * DEPENDENCY MATCH — 1.00 (full trust)
             *
             * The skill appears in the project's actual dependency file:
             * pom.xml, package.json, requirements.txt, build.gradle, etc.
             *
             * This is the strongest possible signal because adding a dependency
             * is a deliberate, technical decision made by the developer — you
             * don't accidentally add Spring Boot to your Maven config. If someone's
             * Java project lists "spring-boot-starter-web" as a dependency, they
             * wrote Java code that actually runs.
             *
             * Full weight (1.00): a 0.85 confidence dependency match contributes
             * 0.85 × 1.00 = 0.85 to the evidence strength.
             */
            Map.entry("dependency_match", new BigDecimal("1.00")),

            /*
             * TOPIC MATCH — 0.85
             *
             * The skill appears as a GitHub repository topic — for example,
             * a repo manually tagged with "java" or "react".
             *
             * Topics are curated by hand, which is a good signal. But they're
             * also easy to add without much depth — someone could tag "java" on
             * a repo that uses Java for a single config file. The 0.85 weight
             * reflects that topics show intent and awareness, but not the same
             * depth of usage as a declared dependency.
             *
             * Reduced weight (0.85): a 0.85 confidence topic match contributes
             * 0.85 × 0.85 = 0.72 — about 15% less than a dependency match.
             */
            Map.entry("topic_match", new BigDecimal("0.85")),

            /*
             * NAME MATCH — 0.72
             *
             * The skill appears in the repository name itself:
             * "java-portfolio-app", "react-dashboard", "python-scraper".
             *
             * Naming a repo after a skill is a reasonable hint, but it's one
             * step removed from the actual code. A repo called "java-experiments"
             * might contain three lines of Java and a lot of README documentation.
             * Moderate weight (0.72) because the name shows association,
             * not necessarily active use.
             *
             * Reduced weight (0.72): a 0.85 confidence name match contributes
             * 0.85 × 0.72 = 0.61 — about 28% less than a dependency match.
             */
            Map.entry("name_match", new BigDecimal("0.72")),

            /*
             * DESCRIPTION MATCH — 0.58
             *
             * The skill appears in the repository's written description:
             * "A web app built with Java and Spring Boot".
             *
             * Descriptions are free-form text — anyone can write anything
             * without it having any relationship to the actual code. This is
             * a weaker corroborating signal. Useful when combined with other
             * matches, but not strong enough to stand alone as proof of usage.
             *
             * Lower weight (0.58): a 0.85 confidence description match
             * contributes 0.85 × 0.58 = 0.49 — roughly half a dependency match.
             */
            Map.entry("description_match", new BigDecimal("0.58")),

            /*
             * LANGUAGE + TEXT MATCH — 0.48
             *
             * The repository's primary language matches the skill AND the skill
             * name appears somewhere in the repo's text (README, description, etc.).
             *
             * This is the weakest named signal because language detection is
             * broad. GitHub might flag a repo as "Java" even when most of the
             * project is YAML config files, with Java only used for a build
             * script. The textual co-occurrence adds a small lift, but the
             * overall signal is indirect and easily inflated.
             *
             * Lowest weight (0.48): a 0.85 confidence language+text match
             * contributes 0.85 × 0.48 = 0.41 — less than half a dependency match.
             */
            Map.entry("language_plus_text_match", new BigDecimal("0.48")),

            /*
             * LLM DOCUMENT MATCH — 1.00 (full pass-through)
             *
             * The AI analyzed an uploaded document — resume, portfolio piece,
             * certificate, project writeup — and assessed how strongly it
             * demonstrates the skill.
             *
             * Unlike GitHub signals, reviewed uploads provide a dedicated evidence
             * depth value. A hello-world program gets low depth. A full CRUD app
             * with integration and error handling gets high depth. The review has
             * already made the quality judgment, so the type weight is full strength.
             *
             * Full pass-through (1.00): a 0.85 evidence depth document match
             * contributes 0.85 × 1.00 = 0.85. The depth itself reflects
             * the difference between a toy project and real-world usage.
             */
            Map.entry("llm_document_match", new BigDecimal("1.00"))
    );

    /**
     * Only uploads that came through our own upload flow are eligible to unlock
     * the expert score tier (scores above 80).
     *
     * GitHub, GitLab, and other connectors produce machine-detected signals that
     * can be gamed — anyone can tag a topic or write a description. Our upload
     * flow sends the document to the AI for active, in-depth review. That active
     * review is what justifies the higher ceiling.
     */
    private static final String LLM_ELIGIBLE_PROVIDER = "manual_upload";

    /**
     * Link types that can contribute to LLM-verified status.
     *
     * - llm_document_match: the current canonical type for all AI-analyzed uploads.
     * - dependency_match / topic_match (legacy): kept for backward compatibility
     *   with evidence records created before llm_document_match was introduced.
     *   All new uploads produce llm_document_match exclusively.
     */
    private static final java.util.Set<String> LLM_ELIGIBLE_LINK_TYPES = java.util.Set.of(
            "llm_document_match",
            "dependency_match",
            "topic_match"
    );

    /**
     * Minimum evidence depth required to treat an upload as reviewed. This is
     * the start of the gradual cap range and does not itself add cap headroom.
     *
     * Below 85%, the upload still contributes through the normal evidence nudge,
     * but it does not unlock a higher ceiling. This prevents
     * a vague document match (e.g. a resume that lists Java once in a skills
     * table with no supporting detail) from reaching the same ceiling as a
     * well-evidenced portfolio piece the AI assessed with high certainty.
     *
     * A depth of 0.87 unlocks a cap of 84. A depth of 0.95 unlocks
     * the full cap of 100. The evidence curve still determines the earned score.
     */
    private static final BigDecimal LLM_MIN_EVIDENCE_DEPTH = new BigDecimal("0.85");

    /** Evidence depth at which reviewed evidence unlocks the full 100-point cap. */
    private static final BigDecimal LLM_FULL_UNLOCK_EVIDENCE_DEPTH = new BigDecimal("0.95");

    /**
     * Score ceiling for claims that have not been LLM-verified.
     *
     * Even a GitHub repo with perfect dependency matches — the strongest
     * machine-detected signal — can only reach 80. Scores above 80 require
     * an active AI review of a user-uploaded document. This reserves the
     * expert tier for evidence that has been deliberately submitted and analyzed,
     * not just passively discovered through a connector.
     */
    public static final int CLAIM_CAP_WITHOUT_LLM = 80;

    /**
     * Maximum ceiling available once reviewed evidence reaches 95% depth.
     */
    public static final int CLAIM_CAP_WITH_LLM = 100;

    /**
     * Returns the trust weight for the given link type.
     *
     * Unrecognized link types get the neutral default (0.50) rather than
     * failing or silently receiving full trust.
     */
    public BigDecimal linkTypeWeight(String linkType) {
        if (linkType == null || linkType.isBlank()) {
            return DEFAULT_LINK_TYPE_WEIGHT;
        }
        return LINK_TYPE_WEIGHTS.getOrDefault(
                linkType.trim().toLowerCase(Locale.ROOT),
                DEFAULT_LINK_TYPE_WEIGHT
        );
    }

    /**
     * Returns true if this evidence signal qualifies a claim for LLM-verified
     * status, which unlocks the expert score tier (above 80).
     *
     * All three conditions must hold:
     *   1. The evidence came from our own upload flow, not an external connector.
     *   2. The link type is one produced by AI document analysis.
     *   3. The demonstrated evidence depth is at least 85%.
     */
    public boolean isEligibleForReviewedStatus(String provider, String linkType, BigDecimal evidenceDepth) {
        if (provider == null || linkType == null || evidenceDepth == null) {
            return false;
        }
        return isLlmReviewSignal(provider, linkType)
                && evidenceDepth.compareTo(LLM_MIN_EVIDENCE_DEPTH) >= 0;
    }

    /**
     * Returns whether a signal came from the reviewed-upload path, independent
     * of its depth. This lets cap calculation inspect sub-threshold reviews
     * without granting them reviewed status.
     */
    public boolean isLlmReviewSignal(String provider, String linkType) {
        if (provider == null || linkType == null) {
            return false;
        }
        return LLM_ELIGIBLE_PROVIDER.equals(provider.trim().toLowerCase(Locale.ROOT))
                && LLM_ELIGIBLE_LINK_TYPES.contains(linkType.trim().toLowerCase(Locale.ROOT));
    }

    /**
     * Gradually unlocks score headroom from 80 at 85% evidence depth to
     * 100 at 95%. Evidence support still determines how much of this cap is earned.
     */
    public int claimScoreCap(BigDecimal evidenceDepth) {
        if (evidenceDepth == null || evidenceDepth.compareTo(LLM_MIN_EVIDENCE_DEPTH) <= 0) {
            return CLAIM_CAP_WITHOUT_LLM;
        }
        BigDecimal bounded = evidenceDepth.min(BigDecimal.ONE);
        BigDecimal progress = bounded.subtract(LLM_MIN_EVIDENCE_DEPTH)
                .divide(LLM_FULL_UNLOCK_EVIDENCE_DEPTH.subtract(LLM_MIN_EVIDENCE_DEPTH), 6, RoundingMode.HALF_UP)
                .max(BigDecimal.ZERO)
                .min(BigDecimal.ONE);
        int unlockedPoints = BigDecimal.valueOf(CLAIM_CAP_WITH_LLM - CLAIM_CAP_WITHOUT_LLM)
                .multiply(progress)
                .setScale(0, RoundingMode.HALF_UP)
                .intValue();
        return CLAIM_CAP_WITHOUT_LLM + unlockedPoints;
    }
}
