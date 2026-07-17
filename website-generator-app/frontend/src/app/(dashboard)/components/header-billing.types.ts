export interface HeaderBillingSummary {
    creditBalance: number | null;
    activePlanKey: string | null;
    portfolioGenerationAllowanceRemaining: number;
    portfolioRefinementAllowanceRemaining: number;
    assetVerificationAllowanceRemaining: number;
}
