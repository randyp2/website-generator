export const LAUNCH_PROMOTION_KEY = "launch_access_2026";

const LAUNCH_WELCOME_PENDING_KEY = "portrn.launch-welcome.pending";

/** Returns whether a billing promotion is the current launch campaign. */
export const isLaunchPromotion = (
    promotionKey: string | null | undefined,
): boolean => promotionKey?.trim() === LAUNCH_PROMOTION_KEY;

/** Marks the current browser session to show the launch welcome after navigation. */
export const markLaunchWelcomePending = (): void => {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.sessionStorage.setItem(LAUNCH_WELCOME_PENDING_KEY, "true");
    } catch {
        // Storage restrictions should not block successful onboarding.
    }
};

/** Consumes the one-time launch welcome marker for the current browser session. */
export const consumeLaunchWelcomePending = (): boolean => {
    if (typeof window === "undefined") {
        return false;
    }

    try {
        const isPending =
            window.sessionStorage.getItem(LAUNCH_WELCOME_PENDING_KEY) ===
            "true";
        window.sessionStorage.removeItem(LAUNCH_WELCOME_PENDING_KEY);
        return isPending;
    } catch {
        return false;
    }
};

/** Extracts the onboarding first name used in the launch welcome message. */
export const getLaunchWelcomeName = (
    fullName: string | null | undefined,
): string => fullName?.trim().split(/\s+/)[0] || "friend";
