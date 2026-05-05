package com.webgen.webgen_backend.billing.controller;

import com.webgen.webgen_backend.billing.dto.webhook.StripeWebhookProcessRequestDTO;
import com.webgen.webgen_backend.billing.dto.webhook.StripeWebhookProcessResponseDTO;
import com.webgen.webgen_backend.billing.service.StripeWebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/billing/webhook")
@RequiredArgsConstructor
public class BillingWebhookController {

    private final StripeWebhookService stripeWebhookService;

    @PostMapping("/stripe")
    public ResponseEntity<StripeWebhookProcessResponseDTO> processStripeWebhook(
            @RequestBody(required = false) String payload,
            @RequestHeader(name = "Stripe-Signature", required = false) String stripeSignature
    ) {
        System.out.println(">>> [BillingCheckout] stripe webhook endpoint hit");
        StripeWebhookProcessRequestDTO request = StripeWebhookProcessRequestDTO.builder()
                .payload(payload)
                .stripeSignature(stripeSignature)
                .build();

        StripeWebhookProcessResponseDTO response = stripeWebhookService.processWebhook(request);

        return ResponseEntity.ok(response);
    }
}
