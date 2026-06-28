package com.webgen.webgen_backend.verification.service.scoring;

import com.webgen.webgen_backend.verification.service.scoring.model.SkillClaimScore;
import com.webgen.webgen_backend.verification.service.scoring.model.SuggestedAction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Builds the deterministic, evidence-aware next-step recommendations for a
 * profile, so a user is never told to do something they have already done.
 */
@Component
@RequiredArgsConstructor
public class SuggestedActionBuilder {

    private static final int MAX_ACTIONS = 30;

    private final SkillScoringPolicy scoringPolicy;
    private final SkillSuggestedActionRuleBook actionRuleBook;

    /**
     * Builds and globally prioritizes suggested actions across unverified claims.
     *
     * @param unverifiedClaims scored claims still needing verification work
     * @return sorted action list capped at {@link #MAX_ACTIONS}
     */
    public List<SuggestedAction> build(List<SkillClaimScore> unverifiedClaims) {
        List<SuggestedAction> actions = new ArrayList<>();

        for (SkillClaimScore claim : unverifiedClaims) {
            actions.addAll(buildActionsForClaim(claim));
        }

        return actions.stream()
                .sorted(
                        Comparator.comparingInt(SuggestedAction::priority).reversed()
                                .thenComparing(SuggestedAction::action, String.CASE_INSENSITIVE_ORDER)
                )
                .limit(MAX_ACTIONS)
                .toList();
    }

    /**
     * Creates deterministic, evidence-aware actions for a single claim.
     *
     * <p>The track depends on what the claim already has:</p>
     * <ul>
     *   <li>unmatched: rename first, then how to add evidence once recognized;</li>
     *   <li>matched, no evidence: connect an account / add the first proof;</li>
     *   <li>matched, evidence present but still capped below the expert ceiling:
     *       upgrade toward fresher work and an AI document review (the only path
     *       past the non-LLM cap);</li>
     *   <li>matched, already verified above the expert ceiling: no action — the
     *       claim is adequately evidenced.</li>
     * </ul>
     */
    private List<SuggestedAction> buildActionsForClaim(SkillClaimScore claim) {
        if (!claim.matched()) {
            List<SuggestedAction> out = new ArrayList<>();
            out.add(new SuggestedAction(
                    claim.claimId(),
                    "Rename this skill",
                    "We don't recognize this skill name yet. Try a more standard term so we can find matching evidence for it.",
                    100
            ));
            appendActions(out, claim, actionRuleBook.genericActions(),
                    "Once the skill name is fixed, adding evidence will push your score up.");
            return out;
        }

        if (isAdequatelyEvidenced(claim)) {
            return List.of();
        }

        List<SuggestedAction> out = new ArrayList<>();
        if (claim.evidenceLinksUsed() > 0) {
            appendActions(out, claim, actionRuleBook.evidenceUpgradeActions(),
                    "You've already got proof here — fresher work and an in-depth review can take this past the standard ceiling.");
        } else {
            appendActions(out, claim, actionRuleBook.actionsForCategory(claim.canonicalCategory()),
                    "This will give us real evidence to back up this skill on your profile.");
        }
        return out;
    }

    /**
     * A matched claim is adequately evidenced once it has cleared the non-LLM
     * ceiling, which is only reachable through strong, AI-reviewed evidence. Such
     * claims need no further nudges.
     */
    private boolean isAdequatelyEvidenced(SkillClaimScore claim) {
        return claim.evidenceLinksUsed() > 0
                && claim.claimScore() > VerificationSignalPolicy.CLAIM_CAP_WITHOUT_LLM;
    }

    /**
     * Appends actions for a claim with descending priority, sharing the claim's
     * computed base priority so ordering stays consistent across tracks.
     */
    private void appendActions(
            List<SuggestedAction> out,
            SkillClaimScore claim,
            List<String> actions,
            String reason
    ) {
        int basePriority = computeBasePriority(claim);
        for (int i = 0; i < actions.size(); i++) {
            out.add(new SuggestedAction(
                    claim.claimId(),
                    actions.get(i),
                    reason,
                    Math.max(1, basePriority - i)
            ));
        }
    }

    /**
     * Computes deterministic per-claim action priority (higher means more urgent).
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
