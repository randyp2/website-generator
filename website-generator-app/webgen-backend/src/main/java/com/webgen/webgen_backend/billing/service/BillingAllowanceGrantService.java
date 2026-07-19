package com.webgen.webgen_backend.billing.service;

import com.webgen.webgen_backend.billing.model.webhook.StripeInvoiceSnapshotModel;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Materializes idempotent feature allowance grants for paid subscription periods.
 */
public interface BillingAllowanceGrantService {

    /**
     * Materializes the first monthly allowance window after a paid invoice is synchronized.
     *
     * @param snapshot normalized paid invoice snapshot
     */
    void applyPaidInvoiceAllowances(StripeInvoiceSnapshotModel snapshot);

    /**
     * Ensures the monthly allowance window containing {@code activeAt} exists for an active plan.
     *
     * @param profileId profile receiving the subscription allowances
     * @param activeAt instant that must fall inside the subscription and allowance windows
     */
    void ensureCurrentSubscriptionAllowances(UUID profileId, OffsetDateTime activeAt);
}
