/** The longest a browser may track one generation job. */
export const GENERATION_POLL_TIMEOUT_MS = 20 * 60 * 1_000;

/** Consecutive transport or server failures allowed before polling stops. */
export const GENERATION_POLL_MAX_CONSECUTIVE_FAILURES = 5;

export type GenerationPollingStopReason =
    | "TIMEOUT"
    | "AUTHORIZATION"
    | "MISSING"
    | "UNAVAILABLE";

/**
 * Applies a shared deadline and failure budget to portfolio generation polling.
 * One successful response resets the failure budget.
 */
export class GenerationPollingGuard {
    private consecutiveFailures = 0;

    public constructor(private readonly startedAt: number) {}

    public stopReason(now: number = Date.now()): GenerationPollingStopReason | null {
        return now - this.startedAt >= GENERATION_POLL_TIMEOUT_MS
            ? "TIMEOUT"
            : null;
    }

    public recordResponse(status: number): GenerationPollingStopReason | null {
        if (status >= 200 && status < 300) {
            this.consecutiveFailures = 0;
            return null;
        }
        if (status === 401 || status === 403) return "AUTHORIZATION";
        if (status === 404 || status === 410) return "MISSING";
        return this.recordNetworkFailure();
    }

    public recordNetworkFailure(): GenerationPollingStopReason | null {
        this.consecutiveFailures += 1;
        return this.consecutiveFailures >=
            GENERATION_POLL_MAX_CONSECUTIVE_FAILURES
            ? "UNAVAILABLE"
            : null;
    }
}
