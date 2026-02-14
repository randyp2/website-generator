export const isRateLimitDisabled = (): boolean =>
    process.env.DISABLE_RATE_LIMIT === "true";
