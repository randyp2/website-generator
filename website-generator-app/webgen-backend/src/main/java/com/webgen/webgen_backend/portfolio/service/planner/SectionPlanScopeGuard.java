package com.webgen.webgen_backend.portfolio.service.planner;

import com.webgen.webgen_backend.portfolio.dto.planner.SectionPlanDTO;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierContext;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Drops "modify" plans that fall outside the clarifier's target scope.
 *
 * Runs at PLAN time, before the plan is shown to the user, so the approval
 * screen shows exactly what will execute. The builder intentionally applies
 * no further filtering: an approved plan must run verbatim, and silently
 * dropping approved work would break that contract.
 */
@Service
public class SectionPlanScopeGuard {

    /**
     * Filters over-scoped planner output against the clarified intent.
     *
     * When scope is "section" or "multi", only sections the clarifier
     * explicitly targeted may be modified; other actions (add/delete/keep)
     * pass through. Broader scopes return the plans unchanged.
     *
     * @param context clarifier context holding scope and targetSectionKeys
     * @param plans   raw planner output
     * @return plans with out-of-scope modifications removed
     */
    public List<SectionPlanDTO> filterToScope(ClarifierContext context, List<SectionPlanDTO> plans) {
        if (plans == null || plans.isEmpty())
            return plans;

        String scope = context.getScope() != null ? context.getScope() : "unknown";
        if (!"section".equals(scope) && !"multi".equals(scope))
            return plans;

        Set<String> targetKeys = context.getTargetSectionKeys() != null
                ? new HashSet<>(context.getTargetSectionKeys())
                : Set.of();

        return plans.stream()
                .filter(plan -> {
                    boolean inScope = !"modify".equals(plan.getAction())
                            || targetKeys.contains(plan.getSectionKey());
                    if (!inScope) {
                        System.out.println(">>> [PLAN-SCOPE] Dropped out-of-scope modify plan: "
                                + plan.getSectionKey() + " (scope=" + scope
                                + ", targets=" + targetKeys + ")");
                    }
                    return inScope;
                })
                .toList();
    }
}
