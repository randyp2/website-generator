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
public class StripeSubscriptionSnapshotModel {

    private String stripeEventId;
    private String stripeSubscriptionId;
    private String stripeCustomerId;
    private UUID profileId;
    private String planKey;
    private String priceId;
    private String status;
    private OffsetDateTime currentPeriodStart;
    private OffsetDateTime currentPeriodEnd;
    private OffsetDateTime cancelAt;
    private Boolean cancelAtPeriodEnd;
    private OffsetDateTime canceledAt;
    private JsonNode metadata;
    private OffsetDateTime occurredAt;
}
