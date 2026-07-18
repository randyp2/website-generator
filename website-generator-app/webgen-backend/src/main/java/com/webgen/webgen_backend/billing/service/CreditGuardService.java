package com.webgen.webgen_backend.billing.service;

import com.webgen.webgen_backend.billing.model.CreditBucket;
import com.webgen.webgen_backend.billing.model.CreditUsagePolicy;

import java.util.Optional;
import java.util.UUID;

public interface CreditGuardService {

    /**
     * Verifies that a feature allowance or the configured general-credit
     * fallback is currently available without reserving or consuming either.
     * The operation must still call {@link #reserveUsage(UUID, CreditUsagePolicy)}
     * immediately before starting billable work.
     *
     * @param profileId authenticated profile id
     * @param policy feature billing policy
     * @throws org.springframework.web.server.ResponseStatusException with HTTP
     * 402 when neither source can cover the operation
     */
    void assertUsageAvailable(UUID profileId, CreditUsagePolicy policy);

    /**
     * Atomically verifies and reserves credits before an operation starts.
     *
     * @param profileId authenticated profile id
     * @param credits credits reserved by the operation
     * @param operationCode short operation identifier used for audit metadata and errors
     * @return reservation id, or empty when credit enforcement is disabled
     */
    Optional<UUID> reserveCredits(UUID profileId, int credits, String operationCode);

    /**
     * Atomically reserves one active feature allowance or falls back to general credits.
     *
     * @param profileId authenticated profile id
     * @param allowanceBucket feature allowance consumed before general credits
     * @param fallbackCredits general credits required when no allowance remains
     * @param operationCode short operation identifier used for audit metadata and errors
     * @return reservation id, or empty when credit enforcement is disabled
     */
    default Optional<UUID> reserveUsage(
            UUID profileId,
            CreditBucket allowanceBucket,
            int fallbackCredits,
            String operationCode
    ) {
        return reserveCredits(profileId, fallbackCredits, operationCode);
    }

    /**
     * Reserves usage according to a feature's declared allowance and fallback policy.
     *
     * @param profileId authenticated profile id
     * @param policy feature billing policy
     * @return reservation id, or empty when credit enforcement is disabled
     */
    default Optional<UUID> reserveUsage(UUID profileId, CreditUsagePolicy policy) {
        if (policy == null) {
            throw new IllegalArgumentException("Credit usage policy is required");
        }
        return reserveUsage(
                profileId,
                policy.allowanceBucket(),
                policy.fallbackCredits(),
                policy.operationCode()
        );
    }

    /**
     * Appends an idempotent compensating entry to the reservation's original bucket.
     *
     * @param reservationId reservation returned by a reserve method on this service
     * @param failureReason concise failure detail stored for billing audit
     */
    void refundCredits(UUID reservationId, String failureReason);
}
