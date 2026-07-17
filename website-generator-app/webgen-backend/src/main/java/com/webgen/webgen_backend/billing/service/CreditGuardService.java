package com.webgen.webgen_backend.billing.service;

import java.util.UUID;

public interface CreditGuardService {

    /**
     * Atomically verifies and consumes credits before an operation starts.
     *
     * @param profileId authenticated profile id
     * @param credits credits consumed by the operation
     * @param operationCode short operation identifier used for audit metadata and errors
     */
    void consumeCredits(UUID profileId, int credits, String operationCode);
}
