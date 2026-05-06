package com.webgen.webgen_backend.billing.dto.webhook;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Raw webhook request contract passed from controller to service.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StripeWebhookProcessRequestDTO {

    private String payload;
    private String stripeSignature;
}
