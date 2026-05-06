export interface HeaderProfileMeResponse {
    billing?: {
        creditBalance?: number | null;
        activePlanKey?: string | null;
    } | null;
}

export interface HeaderBillingSummary {
    creditBalance: number | null;
    activePlanKey: string | null;
}
