/** Billing fields used to derive a user's stable dashboard access identity. */
export interface BillingAccessSnapshot {
    activePlanKey?: string | null;
    activePromotionKey?: string | null;
    creditBalance?: number | null;
}

const formatKeyLabel = (key: string): string =>
    key
        .split("_")
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" ");

/** Returns the durable access identity represented by a billing snapshot. */
export const getBillingAccessLabel = (
    snapshot: BillingAccessSnapshot | null,
): string => {
    const planKey = snapshot?.activePlanKey?.trim();
    if (planKey === "website_generator_pro") {
        return "Pro";
    }
    if (planKey) {
        return formatKeyLabel(planKey);
    }

    const promotionKey = snapshot?.activePromotionKey?.trim();
    if (promotionKey === "launch_access_2026") {
        return "Launch";
    }
    if (promotionKey) {
        return "Promotional";
    }

    return "Free";
};

/** Formats the compact dashboard label without treating allowances as credits. */
export const getCompactBillingAccessLabel = (
    snapshot: BillingAccessSnapshot | null,
): string => {
    if (!snapshot) {
        return "--";
    }

    const accessLabel = getBillingAccessLabel(snapshot);
    const creditBalance = snapshot.creditBalance ?? 0;
    if (creditBalance <= 0) {
        return accessLabel;
    }

    const formattedCredits = creditBalance.toLocaleString();
    if (accessLabel === "Free") {
        return `${formattedCredits} ${creditBalance === 1 ? "credit" : "credits"}`;
    }

    return `${accessLabel} · ${formattedCredits} cr`;
};
