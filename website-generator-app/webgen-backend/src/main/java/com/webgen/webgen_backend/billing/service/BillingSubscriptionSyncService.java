package com.webgen.webgen_backend.billing.service;

import com.webgen.webgen_backend.billing.model.webhook.StripeInvoiceSnapshotModel;
import com.webgen.webgen_backend.billing.model.webhook.StripeSubscriptionSnapshotModel;

public interface BillingSubscriptionSyncService {

    /**
     * Upserts mirrored subscription state from customer.subscription webhook events.
     *
     * @param snapshot normalized subscription snapshot extracted from Stripe webhook payload
     */
    void syncSubscriptionSnapshot(StripeSubscriptionSnapshotModel snapshot);

    /**
     * Applies invoice-derived lifecycle updates to an existing mirrored subscription row.
     *
     * @param snapshot normalized invoice snapshot extracted from Stripe webhook payload
     */
    void syncInvoiceSnapshot(StripeInvoiceSnapshotModel snapshot);
}
