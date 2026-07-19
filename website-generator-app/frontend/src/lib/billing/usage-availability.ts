export type BillingUsageFeature =
    | "portfolio_generation"
    | "portfolio_refinement";

interface BillingUsageSnapshot {
    creditEnforcementEnabled?: boolean | null;
    creditBalance?: number | null;
    portfolioGenerationAllowanceRemaining?: number | null;
    portfolioRefinementAllowanceRemaining?: number | null;
}

interface BillingUsageRequirement {
    allowanceField:
        | "portfolioGenerationAllowanceRemaining"
        | "portfolioRefinementAllowanceRemaining";
    fallbackCredits: number;
}

const BILLING_USAGE_REQUIREMENTS: Record<
    BillingUsageFeature,
    BillingUsageRequirement
> = {
    portfolio_generation: {
        allowanceField: "portfolioGenerationAllowanceRemaining",
        fallbackCredits: 10,
    },
    portfolio_refinement: {
        allowanceField: "portfolioRefinementAllowanceRemaining",
        fallbackCredits: 9,
    },
};

/**
 * Uses a complete cached billing snapshot for immediate UX gating. Unknown or
 * disabled enforcement defers to the authoritative backend credit guard.
 */
export const hasBillingUsageAvailable = (
    snapshot: BillingUsageSnapshot | null | undefined,
    feature: BillingUsageFeature,
): boolean => {
    if (snapshot?.creditEnforcementEnabled !== true) {
        return true;
    }

    const requirement = BILLING_USAGE_REQUIREMENTS[feature];
    const allowance = snapshot[requirement.allowanceField];
    const credits = snapshot.creditBalance;

    if (typeof allowance !== "number" || typeof credits !== "number") {
        return true;
    }

    return allowance > 0 || credits >= requirement.fallbackCredits;
};
