import { describe, expect, it } from "vitest";
import {
    GENERATION_POLL_MAX_CONSECUTIVE_FAILURES,
    GENERATION_POLL_TIMEOUT_MS,
    GenerationPollingGuard,
} from "./generation-polling";

describe("GenerationPollingGuard", () => {
    it("stops a job that has exceeded the polling deadline", () => {
        const guard = new GenerationPollingGuard(1_000);

        expect(guard.stopReason(1_000 + GENERATION_POLL_TIMEOUT_MS)).toBe(
            "TIMEOUT",
        );
    });

    it.each([401, 403])("stops immediately for authorization status %s", (status) => {
        const guard = new GenerationPollingGuard(1_000);

        expect(guard.recordResponse(status)).toBe("AUTHORIZATION");
    });

    it.each([404, 410])("stops immediately when status %s says the job is gone", (status) => {
        const guard = new GenerationPollingGuard(1_000);

        expect(guard.recordResponse(status)).toBe("MISSING");
    });

    it("stops after repeated server failures", () => {
        const guard = new GenerationPollingGuard(1_000);

        for (
            let attempt = 1;
            attempt < GENERATION_POLL_MAX_CONSECUTIVE_FAILURES;
            attempt += 1
        ) {
            expect(guard.recordResponse(502)).toBeNull();
        }

        expect(guard.recordResponse(502)).toBe("UNAVAILABLE");
    });

    it("resets the failure count after a successful response", () => {
        const guard = new GenerationPollingGuard(1_000);

        for (
            let attempt = 1;
            attempt < GENERATION_POLL_MAX_CONSECUTIVE_FAILURES;
            attempt += 1
        ) {
            guard.recordNetworkFailure();
        }

        expect(guard.recordResponse(200)).toBeNull();
        expect(guard.recordNetworkFailure()).toBeNull();
    });
});
