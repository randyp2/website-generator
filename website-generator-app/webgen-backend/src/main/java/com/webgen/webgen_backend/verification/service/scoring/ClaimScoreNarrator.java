package com.webgen.webgen_backend.verification.service.scoring;

import com.webgen.webgen_backend.verification.service.scoring.model.EvidenceLinkSignal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Produces the deterministic, user-facing copy for the score: the per-claim
 * reason text and the overall profile narrative. Holds no scoring math beyond
 * summarizing evidence-link characteristics that the messaging depends on.
 */
@Component
@RequiredArgsConstructor
public class ClaimScoreNarrator {

    private static final int STALE_SIGNAL_DAYS_THRESHOLD = 180;
    private static final BigDecimal STRONG_SIGNAL_THRESHOLD = new BigDecimal("0.80");

    private final SkillScoringPolicy scoringPolicy;

    /**
     * Summarizes the freshness/strength profile of a claim's evidence links so
     * the reason copy can describe why a score moved.
     */
    public EvidenceSignalStats collectEvidenceSignalStats(List<EvidenceLinkSignal> evidenceLinks) {
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

    /**
     * Builds the overall profile narrative shown above the score.
     */
    public String buildProfileScoreNarrative(
            int overallScore,
            int baselineOverallScore,
            int evidenceDelta,
            int matchedSkills,
            int totalSkills,
            int unmatchedSkills,
            String scoreType
    ) {
        boolean isFirstPass = scoreType.equals("initial");

        if (isFirstPass) {
            if (totalSkills == 0) {
                return "Upload your resume or add skills manually to get started.";
            }
            if (matchedSkills == 0) {
                return "Your score is low right now because none of your skills could be recognized yet. "
                        + "Try renaming them to more common terms. Once we can recognize them, "
                        + "connecting GitHub or adding portfolio links will push your score up.";
            }
            if (unmatchedSkills > 0) {
                return "Your verification score starts at 0 because we haven't seen any real-world proof yet. "
                        + unmatchedSkills + " skill" + (unmatchedSkills == 1 ? " couldn't" : "s couldn't")
                        + " be recognized, so " + (unmatchedSkills == 1 ? "it isn't" : "they aren't")
                        + " counted toward your score yet. Rename " + (unmatchedSkills == 1 ? "it" : "them")
                        + " to more common terms to include " + (unmatchedSkills == 1 ? "it" : "them") + ". "
                        + "Connect your GitHub or add portfolio links to start raising your score.";
            }
            return "Your verification score starts at 0. We recognized the skills you added but haven't seen any real-world proof yet. "
                    + "Every skill here needs real-world proof before recruiters can trust it. "
                    + "Connect your GitHub or add portfolio links to start pushing these numbers up.";
        }

        if (evidenceDelta > 0) {
            return "Your projects are backing you up. We found evidence of your skills across your work, "
                    + "which added " + evidenceDelta + " point" + (evidenceDelta == 1 ? "" : "s") + " to your score. "
                    + "Keep adding recent projects to keep building trust.";
        }
        if (evidenceDelta < 0) {
            int drop = Math.abs(evidenceDelta);
            return "We found some evidence, but most of it is older or too indirect to fully back up your claims. "
                    + "that pulled your score down by " + drop + " point" + (drop == 1 ? "" : "s") + ". "
                    + "More recent, hands-on project work will help your score recover.";
        }
        return "We found some activity related to your skills, but not enough to move your score significantly yet. "
                + "More direct proof, such as using a skill in a GitHub repository's dependencies, makes a bigger difference.";
    }

    /**
     * Builds the per-claim reason code and copy explaining its score movement.
     */
    public ClaimReasonComputation buildClaimReason(
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
                        "We recognized this skill claim, but haven't seen it in any of your projects yet. "
                                + "Connect your GitHub or add a portfolio link and your score will go up."
                );
            }
            return new ClaimReasonComputation(
                    "no_match_no_evidence",
                    "We couldn't recognize this skill name. Try using a more common term, "
                            + "such as \"JavaScript\" instead of \"JS\", so we can find matching proof for it."
            );
        }

        String strongestTypePhrase = mapLinkTypeToUserFriendlyLabel(evidenceStats.strongestType());

        if (evidenceContribution > 0) {
            boolean recentStrongSignal = evidenceStats.strongestAgeDays() != null
                    && evidenceStats.strongestAgeDays() <= 30
                    && evidenceStats.strongestStrength() != null
                    && evidenceStats.strongestStrength().compareTo(STRONG_SIGNAL_THRESHOLD) >= 0;

            if (recentStrongSignal) {
                return new ClaimReasonComputation(
                        "evidence_boost_recent_strong",
                        "Your recent projects show you're actively using this skill. "
                                + "that's exactly the kind of proof that matters to recruiters. +"
                                + evidenceContribution + " points."
                );
            }

            return new ClaimReasonComputation(
                    "evidence_boost",
                    "We found proof of this skill in your work" +
                            (strongestTypePhrase != null ? " (strongest signal: " + strongestTypePhrase + ")" : "") +
                            ". That added +" + evidenceContribution + " points to your score."
            );
        }

        if (evidenceContribution == 0) {
            return new ClaimReasonComputation(
                    "evidence_neutral",
                    "We found some activity related to this skill, but it wasn't specific enough to move your score yet."
            );
        }

        boolean mostlyStale = evidenceStats.stale180Count() * 2 >= evidenceLinksUsed;
        boolean strongestIsModerateOrWeak = evidenceStats.strongestStrength() == null
                || evidenceStats.strongestStrength().compareTo(STRONG_SIGNAL_THRESHOLD) < 0;

        if (mostlyStale && strongestIsModerateOrWeak) {
            return new ClaimReasonComputation(
                    "evidence_reduced_stale_and_weak",
                    "The proof we found for this skill is a bit old and indirect. "
                            + "Using it in a more recent project would help push your score back up."
            );
        }

        if (mostlyStale) {
            return new ClaimReasonComputation(
                    "evidence_reduced_stale",
                    "The activity we found for this skill is outdated. "
                            + "More recent work using it would strengthen your score."
            );
        }

        if (strongestIsModerateOrWeak) {
            return new ClaimReasonComputation(
                    "evidence_reduced_strength",
                    "We found some connections, but nothing concrete enough to fully back this up yet. "
                            + "Adding this skill to a project's dependencies or README would make a stronger signal."
            );
        }

        if (finalClaimScore < baselineClaimScore) {
            return new ClaimReasonComputation(
                    "evidence_reduced_mixed",
                    "The signals we found don't clearly confirm this skill. "
                            + "Cleaner, more direct evidence in your projects would improve this score."
            );
        }

        return new ClaimReasonComputation(
                "evidence_neutral",
                "We found some activity related to this skill, but it wasn't specific enough to move your score yet."
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
}
