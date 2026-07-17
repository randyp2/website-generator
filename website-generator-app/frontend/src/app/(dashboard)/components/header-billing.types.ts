export interface HeaderBillingSummary {
    creditBalance: number | null;
    activePlanKey: string | null;
    activePromotionKey: string | null;
    portfolioGenerationAllowanceRemaining: number;
    portfolioRefinementAllowanceRemaining: number;
    assetVerificationAllowanceRemaining: number;
}
