import { describe, expect, it } from "vitest";

import { hasBillingUsageAvailable } from "./usage-availability";

describe("hasBillingUsageAvailable", () => {
    it("blocks known insufficient production usage", () => {
        expect(
            hasBillingUsageAvailable(
                {
                    creditEnforcementEnabled: true,
                    creditBalance: 0,
                    portfolioGenerationAllowanceRemaining: 0,
                    portfolioRefinementAllowanceRemaining: 0,
                },
                "portfolio_generation",
            ),
        ).toBe(false);
        expect(
            hasBillingUsageAvailable(
                {
                    creditEnforcementEnabled: true,
                    creditBalance: 8,
                    portfolioGenerationAllowanceRemaining: 0,
                    portfolioRefinementAllowanceRemaining: 0,
                },
                "portfolio_refinement",
            ),
        ).toBe(false);
    });

    it("allows an allowance or enough fallback credits", () => {
        expect(
            hasBillingUsageAvailable(
                {
                    creditEnforcementEnabled: true,
                    creditBalance: 0,
                    portfolioGenerationAllowanceRemaining: 1,
                },
                "portfolio_generation",
            ),
        ).toBe(true);
        expect(
            hasBillingUsageAvailable(
                {
                    creditEnforcementEnabled: true,
                    creditBalance: 9,
                    portfolioRefinementAllowanceRemaining: 0,
                },
                "portfolio_refinement",
            ),
        ).toBe(true);
    });

    it("defers to the backend when enforcement is disabled or status is unknown", () => {
        expect(
            hasBillingUsageAvailable(
                {
                    creditEnforcementEnabled: false,
                    creditBalance: 0,
                    portfolioGenerationAllowanceRemaining: 0,
                },
                "portfolio_generation",
            ),
        ).toBe(true);
        expect(
            hasBillingUsageAvailable(null, "portfolio_refinement"),
        ).toBe(true);
    });
});
