package com.webgen.webgen_backend.billing.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class BillingInvoiceDTO {

    private String invoiceId;
    private String stripeSubscriptionId;
    private String status;
    private Long amountPaid;
    private Long amountDue;
    private String currency;
    private String billingReason;
    private String planKey;
    private String priceId;
    private String hostedInvoiceUrl;
    private String invoicePdfUrl;
    private OffsetDateTime currentPeriodStart;
    private OffsetDateTime currentPeriodEnd;
    private OffsetDateTime occurredAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
