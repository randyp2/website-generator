import type {
    HeaderBillingSummary,
    HeaderProfileMeResponse,
} from "./header-billing.types";

export const fetchHeaderBillingSummary =
    async (): Promise<HeaderBillingSummary | null> => {
    const response = await fetch("/api/profile/me", {
        method: "GET",
        cache: "no-store",
    });

    if (!response.ok) {
        return null;
    }

    const payload =
        ((await response.json().catch(() => null)) as
            | HeaderProfileMeResponse
            | null) ?? null;
    const balance = payload?.billing?.creditBalance;
    const activePlanKey = payload?.billing?.activePlanKey;

    return {
        creditBalance: typeof balance === "number" ? balance : 0,
        activePlanKey:
            typeof activePlanKey === "string" && activePlanKey.trim()
                ? activePlanKey.trim()
                : null,
    };
};
