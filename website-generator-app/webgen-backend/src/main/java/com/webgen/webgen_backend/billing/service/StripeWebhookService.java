package com.webgen.webgen_backend.billing.service;

import com.webgen.webgen_backend.billing.dto.webhook.StripeWebhookProcessRequestDTO;
import com.webgen.webgen_backend.billing.dto.webhook.StripeWebhookProcessResponseDTO;

public interface StripeWebhookService {

    /**
     * Verifies an inbound Stripe webhook signature, applies idempotency checks,
     * and records the webhook payload for downstream billing handlers.
     *
     * @param request raw webhook request payload and Stripe signature header
     * @return processing outcome including duplicate status and event metadata
     */
    StripeWebhookProcessResponseDTO processWebhook(
            StripeWebhookProcessRequestDTO request
    );
}
