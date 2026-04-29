package com.webgen.webgen_backend.billing.dto.webhook;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Service response contract for webhook processing.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StripeWebhookProcessResponseDTO {

    private boolean processed;
    private boolean duplicate;
    private String stripeEventId;
    private String eventType;
}
