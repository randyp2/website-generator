package com.webgen.webgen_backend.billing.model.webhook;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StripeInvoiceSnapshotModel {

    private String stripeEventId;
    private StripeWebhookEventType eventType;
    private String invoiceId;
    private String stripeCustomerId;
    private String stripeSubscriptionId;
    private UUID profileId;
    private String billingReason;
    private String status;
    private Long amountPaid;
    private Long amountDue;
    private String currency;
    private String planKey;
    private String priceId;
    private String hostedInvoiceUrl;
    private String invoicePdfUrl;
    private OffsetDateTime currentPeriodStart;
    private OffsetDateTime currentPeriodEnd;
    private JsonNode metadata;
    private OffsetDateTime occurredAt;
}
