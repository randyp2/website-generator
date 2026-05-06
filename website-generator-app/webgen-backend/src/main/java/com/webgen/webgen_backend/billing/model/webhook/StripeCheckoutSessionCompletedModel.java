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
public class StripeCheckoutSessionCompletedModel {

    private String stripeEventId;
    private String checkoutSessionId;
    private String stripeCustomerId;
    private String stripeSubscriptionId;
    private UUID profileId;
    private String priceId;
    private String priceKey;
    private String purchaseType;
    private String planKey;
    private JsonNode metadata;
    private OffsetDateTime occurredAt;
}
