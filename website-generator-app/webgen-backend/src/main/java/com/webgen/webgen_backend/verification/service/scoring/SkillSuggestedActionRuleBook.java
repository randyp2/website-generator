package com.webgen.webgen_backend.verification.service.scoring;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Deterministic category-to-action rule table used for Phase 4 suggested actions.
 */
@Component
public class SkillSuggestedActionRuleBook {

    /**
     * Category-specific actions for canonical skills.
     */
    private static final Map<String, List<String>> CATEGORY_ACTIONS = Map.of(
            "engineering", List.of(
                    "Connect GitHub",
                    "Link portfolio project URL",
                    "Upload code sample or certificate"
            ),
            "marketing", List.of(
                    "Connect LinkedIn",
                    "Upload campaign screenshot/case study",
                    "Add metric-backed portfolio link"
            ),
            "accounting", List.of(
                    "Upload certification/license",
                    "Upload anonymized work sample",
                    "Connect LinkedIn"
            ),
            "design", List.of(
                    "Link Dribbble/Behance/portfolio",
                    "Upload design case study"
            ),
            "business_sales", List.of(
                    "Upload KPI case study",
                    "Connect LinkedIn"
            )
    );

    /**
     * Fallback actions used when category is unknown or claim is unresolved.
     */
    private static final List<String> GENERIC_ACTIONS = List.of(
            "Link portfolio project URL",
            "Upload supporting certificate or work sample",
            "Connect a relevant account for evidence"
    );

    /**
     * Next-tier actions for a matched claim that already has linked evidence.
     * Rather than re-suggesting evidence the user already provided, these point
     * toward fresher proof and the AI document-review (upload) path, which is the
     * only route past the non-LLM score ceiling.
     */
    private static final List<String> EVIDENCE_UPGRADE_ACTIONS = List.of(
            "Add a more recent project",
            "Upload a portfolio piece for an in-depth review"
    );

    /**
     * Resolves deterministic next actions for a category.
     *
     * @param normalizedCategory canonical category key
     * @return ordered action list
     */
    public List<String> actionsForCategory(String normalizedCategory) {
        return CATEGORY_ACTIONS.getOrDefault(normalizedCategory, GENERIC_ACTIONS);
    }

    /**
     * Returns generic fallback actions.
     *
     * @return fallback action list
     */
    public List<String> genericActions() {
        return GENERIC_ACTIONS;
    }

    /**
     * Returns next-tier actions for claims that already have linked evidence.
     *
     * @return evidence-upgrade action list
     */
    public List<String> evidenceUpgradeActions() {
        return EVIDENCE_UPGRADE_ACTIONS;
    }
}
