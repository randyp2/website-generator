package com.webgen.webgen_backend.billing.service;

import com.webgen.webgen_backend.billing.model.webhook.StripeCheckoutSessionCompletedModel;
import com.webgen.webgen_backend.billing.model.webhook.StripeInvoiceSnapshotModel;

public interface BillingCreditLedgerService {

    /**
     * Fulfills one-time credit purchases from checkout.session.completed events.
     *
     * @param snapshot normalized checkout session snapshot extracted from Stripe webhook payload
     */
    void fulfillCheckoutSessionCompleted(StripeCheckoutSessionCompletedModel snapshot);

    /**
     * Applies invoice.paid credit grants when a subscription enters a billable period.
     *
     * @param snapshot normalized invoice snapshot extracted from Stripe webhook payload
     */
    void applyInvoicePaidCredits(StripeInvoiceSnapshotModel snapshot);
}
