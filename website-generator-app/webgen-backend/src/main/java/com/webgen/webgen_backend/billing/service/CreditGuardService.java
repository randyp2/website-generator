package com.webgen.webgen_backend.billing.service;

import java.util.Optional;
import java.util.UUID;

public interface CreditGuardService {

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
     * Appends an idempotent compensating credit entry for a failed operation.
     *
     * @param reservationId reservation returned by {@link #reserveCredits(UUID, int, String)}
     * @param failureReason concise failure detail stored for billing audit
     */
    void refundCredits(UUID reservationId, String failureReason);
}
