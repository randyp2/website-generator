package com.webgen.webgen_backend.billing.service;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Materializes idempotent free-tier and promotional feature grants.
 */
public interface BillingEntitlementGrantService {

    /**
     * Ensures every currently eligible lifetime entitlement exists.
     *
     * @param profileId profile receiving the entitlements
     * @param activeAt grant activation time
     */
    void ensureCurrentEntitlements(UUID profileId, OffsetDateTime activeAt);
}
