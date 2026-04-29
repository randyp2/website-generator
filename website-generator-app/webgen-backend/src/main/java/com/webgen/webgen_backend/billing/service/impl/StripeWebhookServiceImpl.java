package com.webgen.webgen_backend.billing.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import com.webgen.webgen_backend.billing.config.StripeProperties;
import com.webgen.webgen_backend.billing.dto.webhook.StripeWebhookProcessRequestDTO;
import com.webgen.webgen_backend.billing.dto.webhook.StripeWebhookProcessResponseDTO;
import com.webgen.webgen_backend.billing.entity.StripeWebhookEvent;
import com.webgen.webgen_backend.billing.model.webhook.StripeWebhookEventType;
import com.webgen.webgen_backend.billing.repository.StripeWebhookEventRepository;
import com.webgen.webgen_backend.billing.service.StripeWebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StripeWebhookServiceImpl implements StripeWebhookService {

    private final StripeProperties stripeProperties;
    private final StripeWebhookEventRepository stripeWebhookEventRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public StripeWebhookProcessResponseDTO processWebhook(
            StripeWebhookProcessRequestDTO request
    ) {
        // --- Validate inbound webhook request and Stripe configuration
        String payload = requirePayload(request);
        String stripeSignature = requireStripeSignature(request);
        String webhookSecret = requireWebhookSecret();

        // --- Verify Stripe signature and construct trusted event metadata
        Event event = constructVerifiedEvent(payload, stripeSignature, webhookSecret);
        String stripeEventId = requireStripeEventId(event);
        String eventType = requireEventType(event);

        // --- Return early when this webhook event has already been processed
        if (stripeWebhookEventRepository.existsByStripeEventId(stripeEventId)) {
            return StripeWebhookProcessResponseDTO.builder()
                    .processed(false)
                    .duplicate(true)
                    .stripeEventId(stripeEventId)
                    .eventType(eventType)
                    .build();
        }

        // --- Parse and validate raw payload for durable idempotency/audit storage
        JsonNode payloadJson = parsePayloadJson(payload);
        if (!payloadJson.isObject()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Stripe webhook payload must be a JSON object"
            );
        }

        // --- Normalize event type now so unsupported events are handled predictably
        StripeWebhookEventType normalizedType = StripeWebhookEventType
                .fromValue(eventType)
                .orElse(null);

        // --- Dispatch business handlers (intentionally no-op in this phase)
        dispatchEvent(normalizedType);

        // --- Persist webhook event for idempotency and audit tracking
        StripeWebhookEvent webhookAuditRecord = buildWebhookAuditRecord(
                stripeEventId,
                eventType,
                payloadJson
        );

        try {
            stripeWebhookEventRepository.save(webhookAuditRecord);
        } catch (DataIntegrityViolationException exception) {
            return StripeWebhookProcessResponseDTO.builder()
                    .processed(false)
                    .duplicate(true)
                    .stripeEventId(stripeEventId)
                    .eventType(eventType)
                    .build();
        }

        return StripeWebhookProcessResponseDTO.builder()
                .processed(true)
                .duplicate(false)
                .stripeEventId(stripeEventId)
                .eventType(eventType)
                .build();
    }

    private String requirePayload(StripeWebhookProcessRequestDTO request) {
        if (request == null || !StringUtils.hasText(request.getPayload())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stripe webhook payload is required");
        }
        return request.getPayload();
    }

    private String requireStripeSignature(StripeWebhookProcessRequestDTO request) {
        if (!StringUtils.hasText(request.getStripeSignature())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stripe-Signature header is required");
        }
        return request.getStripeSignature();
    }

    private String requireWebhookSecret() {
        if (!StringUtils.hasText(stripeProperties.getWebhookSecret())) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Stripe webhook secret is not configured"
            );
        }
        return stripeProperties.getWebhookSecret().trim();
    }

    private Event constructVerifiedEvent(
            String payload,
            String stripeSignature,
            String webhookSecret
    ) {
        try {
            return Webhook.constructEvent(payload, stripeSignature, webhookSecret);
        } catch (SignatureVerificationException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid Stripe webhook signature",
                    exception
            );
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Malformed Stripe webhook payload",
                    exception
            );
        }
    }

    private String requireStripeEventId(Event event) {
        if (event == null || !StringUtils.hasText(event.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stripe webhook event id is required");
        }
        return event.getId().trim();
    }

    private String requireEventType(Event event) {
        if (event == null || !StringUtils.hasText(event.getType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stripe webhook event type is required");
        }
        return event.getType().trim();
    }

    private JsonNode parsePayloadJson(String payload) {
        try {
            return objectMapper.readTree(payload);
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unable to parse Stripe webhook payload",
                    exception
            );
        }
    }

    private void dispatchEvent(StripeWebhookEventType normalizedType) {
        if (normalizedType == null) {
            return;
        }

        switch (normalizedType) {
            // --- Subscription lifecycle events will be synchronized in BillingSubscriptionSyncService.
            case CUSTOMER_SUBSCRIPTION_CREATED, CUSTOMER_SUBSCRIPTION_UPDATED, CUSTOMER_SUBSCRIPTION_DELETED -> {
            }
            // --- Checkout completion events will be fulfilled in BillingCreditLedgerService.
            case CHECKOUT_SESSION_COMPLETED -> {
            }
            // --- Invoice events will update renewal state and credit grants in BillingCreditLedgerService.
            case INVOICE_PAID, INVOICE_PAYMENT_FAILED -> {
            }
            default -> {
            }
        }
    }

    private StripeWebhookEvent buildWebhookAuditRecord(
            String stripeEventId,
            String eventType,
            JsonNode payloadJson
    ) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        StripeWebhookEvent webhookEvent = new StripeWebhookEvent();
        webhookEvent.setId(UUID.randomUUID());
        webhookEvent.setStripeEventId(stripeEventId);
        webhookEvent.setEventType(eventType);
        webhookEvent.setPayload(payloadJson);
        webhookEvent.setProcessedAt(now);
        webhookEvent.setCreatedAt(now);

        return webhookEvent;
    }
}
