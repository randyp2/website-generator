package com.webgen.webgen_backend.portfolio.service.builder;

import com.webgen.webgen_backend.portfolio.dto.planner.SectionPlanDTO;
import com.webgen.webgen_backend.portfolio.exception.RefinePlanConflictException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Reconciles an approved plan with the portfolio's persisted sections before
 * any LLM work runs.
 *
 * Plans are made against a snapshot; by approval time the DB may have moved
 * on. Executing a mismatched plan silently corrupts intent (a stale "modify"
 * becomes create-from-scratch, a stale "add" overwrites an existing section),
 * so real conflicts fail fast as 409 and harmless no-op deletes are dropped.
 */
@Service
public class PlanConsistencyValidator {

    /**
     * Validates every plan action against the current section keys.
     *
     * @param plans        approved section plans
     * @param existingKeys sectionKeys currently persisted for the portfolio
     * @return plans with no-op deletes removed
     * @throws RefinePlanConflictException when a modify targets a missing
     *                                     section or an add targets an existing one
     */
    public List<SectionPlanDTO> reconcile(List<SectionPlanDTO> plans, Set<String> existingKeys) {
        List<String> staleModifies = keysWhere(plans, "modify", key -> !existingKeys.contains(key));
        if (!staleModifies.isEmpty())
            throw new RefinePlanConflictException("sections no longer exist: " + String.join(", ", staleModifies));

        List<String> collidingAdds = keysWhere(plans, "add", existingKeys::contains);
        if (!collidingAdds.isEmpty())
            throw new RefinePlanConflictException("sections already exist: " + String.join(", ", collidingAdds));

        // Deleting a section that is already gone is a no-op, not a conflict
        return plans.stream()
                .filter(plan -> {
                    boolean noOpDelete = "delete".equals(plan.getAction())
                            && !existingKeys.contains(plan.getSectionKey());
                    if (noOpDelete) {
                        System.out.println(">>> [PLAN-CHECK] Dropped no-op delete for missing section: "
                                + plan.getSectionKey());
                    }
                    return !noOpDelete;
                })
                .toList();
    }

    private List<String> keysWhere(
            List<SectionPlanDTO> plans,
            String action,
            java.util.function.Predicate<String> keyPredicate
    ) {
        return plans.stream()
                .filter(plan -> action.equals(plan.getAction()))
                .map(SectionPlanDTO::getSectionKey)
                .filter(keyPredicate)
                .collect(Collectors.toList());
    }
}
