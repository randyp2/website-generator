package com.webgen.webgen_backend.billing.service;

import java.util.UUID;

public interface CreditGuardService {

    /**
     * Ensures a profile has the minimum required credits before an operation starts.
     *
     * @param profileId authenticated profile id
     * @param requiredCredits credits required to proceed
     * @param operationCode short operation identifier used in error responses
     */
    void assertHasRequiredCredits(UUID profileId, int requiredCredits, String operationCode);
}
