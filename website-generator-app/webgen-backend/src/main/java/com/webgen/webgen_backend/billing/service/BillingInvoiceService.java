package com.webgen.webgen_backend.billing.service;

import com.webgen.webgen_backend.billing.dto.BillingInvoiceDTO;
import com.webgen.webgen_backend.billing.model.webhook.StripeInvoiceSnapshotModel;

import java.util.List;
import java.util.UUID;

public interface BillingInvoiceService {

    /**
     * Upserts normalized Stripe invoice data into local invoice history storage.
     *
     * @param snapshot normalized invoice webhook payload
     */
    void syncInvoiceSnapshot(StripeInvoiceSnapshotModel snapshot);

    /**
     * Returns recent invoices for a profile ordered newest first.
     *
     * @param profileId authenticated profile identifier
     * @param limit max number of rows to return
     * @return recent invoice rows
     */
    List<BillingInvoiceDTO> listRecentInvoices(UUID profileId, Integer limit);
}
