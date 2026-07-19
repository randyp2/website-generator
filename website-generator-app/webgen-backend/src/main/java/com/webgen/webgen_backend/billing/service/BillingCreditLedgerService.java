package com.webgen.webgen_backend.billing.service;

import com.webgen.webgen_backend.billing.dto.BillingCreditPurchaseDTO;
import com.webgen.webgen_backend.billing.model.webhook.StripeCheckoutSessionSnapshotModel;
import com.webgen.webgen_backend.billing.model.webhook.StripeInvoiceSnapshotModel;

import java.util.List;
import java.util.UUID;

public interface BillingCreditLedgerService {

    /**
     * Fulfills a one-time credit purchase only when its Checkout payment is confirmed.
     *
     * @param snapshot normalized checkout session snapshot extracted from Stripe webhook payload
     */
    void fulfillCheckoutSession(StripeCheckoutSessionSnapshotModel snapshot);

    /**
     * Applies invoice.paid allowance grants when a subscription enters a billable period.
     *
     * @param snapshot normalized invoice snapshot extracted from Stripe webhook payload
     */
    void applyInvoicePaidAllowances(StripeInvoiceSnapshotModel snapshot);

    /**
     * Lists fulfilled credit-pack purchases without exposing unrelated credit movements.
     *
     * @param profileId authenticated profile that owns the ledger entries
     * @param limit maximum number of recent purchases to return
     */
    List<BillingCreditPurchaseDTO> listRecentCreditPurchases(UUID profileId, Integer limit);
}
