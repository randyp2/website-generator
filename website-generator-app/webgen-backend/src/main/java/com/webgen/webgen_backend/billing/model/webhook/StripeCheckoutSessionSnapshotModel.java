package com.webgen.webgen_backend.billing.model.webhook;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

/** Trusted Checkout Session fields extracted from a verified Stripe webhook. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StripeCheckoutSessionSnapshotModel {

    private String stripeEventId;
    private StripeWebhookEventType eventType;
    private String checkoutSessionId;
    private String paymentStatus;
    private String stripeCustomerId;
    private String stripeSubscriptionId;
    private UUID profileId;
    private String priceId;
    private String priceKey;
    private String purchaseType;
    private String planKey;
    private String paymentIntentId;
    private Long amountTotal;
    private String currency;
    private JsonNode metadata;
    private OffsetDateTime occurredAt;
}
