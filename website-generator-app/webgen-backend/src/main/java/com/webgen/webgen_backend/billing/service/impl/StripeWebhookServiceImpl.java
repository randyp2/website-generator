package com.webgen.webgen_backend.billing.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import com.webgen.webgen_backend.billing.config.StripeProperties;
import com.webgen.webgen_backend.billing.dto.webhook.StripeWebhookProcessRequestDTO;
import com.webgen.webgen_backend.billing.dto.webhook.StripeWebhookProcessResponseDTO;
import com.webgen.webgen_backend.billing.model.webhook.StripeCheckoutSessionSnapshotModel;
import com.webgen.webgen_backend.billing.model.webhook.StripeInvoiceSnapshotModel;
import com.webgen.webgen_backend.billing.model.webhook.StripeSubscriptionSnapshotModel;
import com.webgen.webgen_backend.billing.model.webhook.StripeWebhookEventType;
import com.webgen.webgen_backend.billing.service.BillingCreditLedgerService;
import com.webgen.webgen_backend.billing.service.BillingInvoiceService;
import com.webgen.webgen_backend.billing.service.BillingSubscriptionSyncService;
import com.webgen.webgen_backend.billing.service.StripeWebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StripeWebhookServiceImpl implements StripeWebhookService {

    private final StripeProperties stripeProperties;
    private final BillingSubscriptionSyncService billingSubscriptionSyncService;
    private final BillingCreditLedgerService billingCreditLedgerService;
    private final BillingInvoiceService billingInvoiceService;
    private final StripeWebhookEventStateService stripeWebhookEventStateService;
    private final PlatformTransactionManager transactionManager;
    private final ObjectMapper objectMapper;

    @Override
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

        System.out.println(">>> [StripeWebhook] received event id=" + stripeEventId + " type=" + eventType);

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
        OffsetDateTime occurredAt = extractOccurredAt(payloadJson);

        // --- Claim this Stripe event before running side effects.
        StripeWebhookEventStateService.ClaimResult claimResult = stripeWebhookEventStateService
                .claimWebhookEvent(stripeEventId, eventType, payloadJson);
        if (claimResult.outcome() != StripeWebhookEventStateService.ClaimOutcome.CLAIMED) {
            System.out.println(">>> [StripeWebhook] event id=" + stripeEventId
                    + " not claimed (outcome=" + claimResult.outcome() + ") — skipping");
            return StripeWebhookProcessResponseDTO.builder()
                    .processed(false)
                    .duplicate(true)
                    .stripeEventId(stripeEventId)
                    .eventType(eventType)
                    .build();
        }

        // --- Execute handlers in a dedicated transaction, then finalize event state.
        try {
            runDispatchInTransaction(normalizedType, stripeEventId, payloadJson, occurredAt);
            stripeWebhookEventStateService.markProcessed(claimResult.webhookEventRowId());
        } catch (RuntimeException exception) {
            stripeWebhookEventStateService.markFailed(claimResult.webhookEventRowId(), exception);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Stripe webhook processing failed",
                    exception
            );
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

    private void runDispatchInTransaction(
            StripeWebhookEventType normalizedType,
            String stripeEventId,
            JsonNode payloadJson,
            OffsetDateTime occurredAt
    ) {
        TransactionTemplate template = new TransactionTemplate(transactionManager);
        template.executeWithoutResult(ignored ->
                dispatchEvent(normalizedType, stripeEventId, payloadJson, occurredAt));
    }

    private void dispatchEvent(
            StripeWebhookEventType normalizedType,
            String stripeEventId,
            JsonNode payloadJson,
            OffsetDateTime occurredAt
    ) {
        if (normalizedType == null) {
            return;
        }

        switch (normalizedType) {
            // --- Subscription lifecycle events mirror Stripe subscription state in local storage.
            case CUSTOMER_SUBSCRIPTION_CREATED, CUSTOMER_SUBSCRIPTION_UPDATED, CUSTOMER_SUBSCRIPTION_DELETED -> {
                StripeSubscriptionSnapshotModel snapshot = buildSubscriptionSnapshot(
                        stripeEventId,
                        payloadJson,
                        occurredAt
                );
                if (snapshot != null) {
                    System.out.println(">>> [StripeWebhook] dispatch -> subscription sync subId="
                            + snapshot.getStripeSubscriptionId() + " type=" + normalizedType);
                    billingSubscriptionSyncService.syncSubscriptionSnapshot(snapshot);
                }
            }
            // Checkout payment events fulfill one-time purchases only after payment confirmation.
            case CHECKOUT_SESSION_COMPLETED,
                    CHECKOUT_SESSION_ASYNC_PAYMENT_SUCCEEDED,
                    CHECKOUT_SESSION_ASYNC_PAYMENT_FAILED -> {
                StripeCheckoutSessionSnapshotModel snapshot = buildCheckoutSessionSnapshot(
                        stripeEventId,
                        normalizedType,
                        payloadJson,
                        occurredAt
                );
                if (snapshot != null) {
                    System.out.println(">>> [StripeWebhook] dispatch -> checkout fulfillment sessionId="
                            + snapshot.getCheckoutSessionId() + " purchaseType=" + snapshot.getPurchaseType());
                    billingCreditLedgerService.fulfillCheckoutSession(snapshot);
                }
            }

            // Invoice events refresh subscription status; paid invoices also grant plan allowances.
            case INVOICE_PAID, INVOICE_PAYMENT_FAILED -> {
                StripeInvoiceSnapshotModel snapshot = buildInvoiceSnapshot(
                        stripeEventId,
                        normalizedType,
                        payloadJson,
                        occurredAt
                );
                if (snapshot != null) {
                    System.out.println(">>> [StripeWebhook] dispatch -> invoice invoiceId="
                            + snapshot.getInvoiceId() + " type=" + normalizedType);
                    billingInvoiceService.syncInvoiceSnapshot(snapshot);
                    billingSubscriptionSyncService.syncInvoiceSnapshot(snapshot);
                    if (normalizedType == StripeWebhookEventType.INVOICE_PAID) {
                        billingCreditLedgerService.applyInvoicePaidAllowances(snapshot);
                    }
                }
            }
            default -> {
            }
        }
    }

    private StripeSubscriptionSnapshotModel buildSubscriptionSnapshot(
            String stripeEventId,
            JsonNode payloadJson,
            OffsetDateTime occurredAt
    ) {
        JsonNode objectNode = extractEventObject(payloadJson);
        if (objectNode == null) {
            return null;
        }

        JsonNode metadata = extractMetadata(objectNode);
        return StripeSubscriptionSnapshotModel.builder()
                .stripeEventId(stripeEventId)
                .stripeSubscriptionId(extractObjectRefId(objectNode, "id"))
                .stripeCustomerId(extractObjectRefId(objectNode, "customer"))
                .profileId(parseUuid(metadataText(metadata, "profile_id"), "profile_id"))
                .planKey(metadataText(metadata, "plan_key"))
                .priceId(extractSubscriptionPriceId(objectNode))
                .status(textValue(objectNode, "status"))
                .currentPeriodStart(extractTimestamp(objectNode, "current_period_start"))
                .currentPeriodEnd(extractTimestamp(objectNode, "current_period_end"))
                .cancelAt(extractTimestamp(objectNode, "cancel_at"))
                .cancelAtPeriodEnd(booleanValue(objectNode, "cancel_at_period_end"))
                .canceledAt(extractTimestamp(objectNode, "canceled_at"))
                .metadata(metadata)
                .occurredAt(occurredAt)
                .build();
    }

    private StripeCheckoutSessionSnapshotModel buildCheckoutSessionSnapshot(
            String stripeEventId,
            StripeWebhookEventType eventType,
            JsonNode payloadJson,
            OffsetDateTime occurredAt
    ) {
        JsonNode objectNode = extractEventObject(payloadJson);
        if (objectNode == null) {
            return null;
        }

        JsonNode metadata = extractMetadata(objectNode);
        String priceKey = metadataText(metadata, "price_key");

        UUID profileId = parseUuid(metadataText(metadata, "profile_id"), "profile_id");
        if (profileId == null) {
            profileId = parseUuid(textValue(objectNode, "client_reference_id"), "client_reference_id");
        }

        return StripeCheckoutSessionSnapshotModel.builder()
                .stripeEventId(stripeEventId)
                .eventType(eventType)
                .checkoutSessionId(extractObjectRefId(objectNode, "id"))
                .paymentStatus(textValue(objectNode, "payment_status"))
                .stripeCustomerId(extractObjectRefId(objectNode, "customer"))
                .stripeSubscriptionId(extractObjectRefId(objectNode, "subscription"))
                .profileId(profileId)
                .priceId(resolveCheckoutPriceId(priceKey))
                .priceKey(priceKey)
                .purchaseType(metadataText(metadata, "purchase_type"))
                .planKey(metadataText(metadata, "plan_key"))
                .paymentIntentId(extractObjectRefId(objectNode, "payment_intent"))
                .amountTotal(longValue(objectNode, "amount_total"))
                .currency(textValue(objectNode, "currency"))
                .metadata(metadata)
                .occurredAt(occurredAt)
                .build();
    }

    private StripeInvoiceSnapshotModel buildInvoiceSnapshot(
            String stripeEventId,
            StripeWebhookEventType eventType,
            JsonNode payloadJson,
            OffsetDateTime occurredAt
    ) {
        JsonNode objectNode = extractEventObject(payloadJson);
        if (objectNode == null) {
            return null;
        }

        JsonNode metadata = extractMetadata(objectNode);
        JsonNode parentSubscriptionMetadata = extractParentSubscriptionMetadata(objectNode);
        String profileIdValue = firstNonBlank(
                metadataText(metadata, "profile_id"),
                metadataText(parentSubscriptionMetadata, "profile_id")
        );
        String planKeyValue = firstNonBlank(
                metadataText(metadata, "plan_key"),
                metadataText(parentSubscriptionMetadata, "plan_key")
        );

        return StripeInvoiceSnapshotModel.builder()
                .stripeEventId(stripeEventId)
                .eventType(eventType)
                .invoiceId(extractObjectRefId(objectNode, "id"))
                .stripeCustomerId(extractObjectRefId(objectNode, "customer"))
                .stripeSubscriptionId(extractInvoiceSubscriptionId(objectNode))
                .profileId(parseUuid(profileIdValue, "profile_id"))
                .billingReason(textValue(objectNode, "billing_reason"))
                .status(textValue(objectNode, "status"))
                .amountPaid(longValue(objectNode, "amount_paid"))
                .amountDue(longValue(objectNode, "amount_due"))
                .currency(textValue(objectNode, "currency"))
                .planKey(planKeyValue)
                .priceId(extractInvoicePriceId(objectNode))
                .hostedInvoiceUrl(textValue(objectNode, "hosted_invoice_url"))
                .invoicePdfUrl(textValue(objectNode, "invoice_pdf"))
                .currentPeriodStart(extractInvoicePeriodStart(objectNode))
                .currentPeriodEnd(extractInvoicePeriodEnd(objectNode))
                .metadata(metadata)
                .occurredAt(occurredAt)
                .build();
    }

    private JsonNode extractEventObject(JsonNode payloadJson) {
        JsonNode objectNode = payloadJson.path("data").path("object");
        if (objectNode.isObject()) {
            return objectNode;
        }
        return null;
    }

    private JsonNode extractMetadata(JsonNode objectNode) {
        JsonNode metadata = objectNode.path("metadata");
        if (metadata.isObject()) {
            return metadata;
        }
        return objectMapper.createObjectNode();
    }

    private JsonNode extractParentSubscriptionMetadata(JsonNode objectNode) {
        JsonNode metadata = objectNode.path("parent").path("subscription_details").path("metadata");
        if (metadata.isObject()) {
            return metadata;
        }
        return objectMapper.createObjectNode();
    }

    private String resolveCheckoutPriceId(String priceKey) {
        if (!StringUtils.hasText(priceKey)) {
            return null;
        }

        String normalized = priceKey.trim().toUpperCase();
        return switch (normalized) {
            case "WEBSITE_GENERATOR_PRO_MONTHLY" -> nullableTrim(stripeProperties.getPrice().getWebsiteGeneratorProMonthly());
            case "WEBSITE_GENERATOR_PRO_ANNUAL" -> nullableTrim(stripeProperties.getPrice().getWebsiteGeneratorProAnnual());
            case "CREDIT_PACK_SMALL" -> nullableTrim(stripeProperties.getPrice().getCreditPackSmall());
            case "CREDIT_PACK_MEDIUM" -> nullableTrim(stripeProperties.getPrice().getCreditPackMedium());
            case "CREDIT_PACK_LARGE" -> nullableTrim(stripeProperties.getPrice().getCreditPackLarge());
            default -> null;
        };
    }

    private String extractSubscriptionPriceId(JsonNode objectNode) {
        JsonNode items = objectNode.path("items").path("data");
        if (!items.isArray() || items.isEmpty()) {
            return null;
        }

        JsonNode firstItem = items.get(0);
        String priceId = extractObjectRefId(firstItem, "price");
        if (StringUtils.hasText(priceId)) {
            return priceId;
        }
        return extractObjectRefId(firstItem, "plan");
    }

    private String extractInvoicePriceId(JsonNode objectNode) {
        JsonNode subscriptionLine = findSubscriptionLineItem(objectNode);
        if (subscriptionLine != null) {
            String priceId = extractObjectRefId(subscriptionLine, "price");
            if (StringUtils.hasText(priceId)) {
                return priceId;
            }

            String priceFromPricing = textValue(
                    subscriptionLine.path("pricing").path("price_details"),
                    "price"
            );
            if (StringUtils.hasText(priceFromPricing)) {
                return priceFromPricing;
            }
        }

        JsonNode lines = objectNode.path("lines").path("data");
        if (!lines.isArray() || lines.isEmpty()) {
            return null;
        }

        JsonNode firstLine = lines.get(0);
        String legacyPrice = extractObjectRefId(firstLine, "price");
        if (StringUtils.hasText(legacyPrice)) {
            return legacyPrice;
        }

        return textValue(firstLine.path("pricing").path("price_details"), "price");
    }

    private String extractInvoiceSubscriptionId(JsonNode objectNode) {
        String directSubscriptionId = extractObjectRefId(objectNode, "subscription");
        if (StringUtils.hasText(directSubscriptionId)) {
            return directSubscriptionId;
        }

        String fromInvoiceParent = textValue(
                objectNode.path("parent").path("subscription_details"),
                "subscription"
        );
        if (StringUtils.hasText(fromInvoiceParent)) {
            return fromInvoiceParent;
        }

        JsonNode subscriptionLine = findSubscriptionLineItem(objectNode);
        if (subscriptionLine == null) {
            return null;
        }

        String fromSubscriptionItemParent = textValue(
                subscriptionLine.path("parent").path("subscription_item_details"),
                "subscription"
        );
        if (StringUtils.hasText(fromSubscriptionItemParent)) {
            return fromSubscriptionItemParent;
        }

        return textValue(
                subscriptionLine.path("parent").path("invoice_item_details"),
                "subscription"
        );
    }

    private OffsetDateTime extractInvoicePeriodStart(JsonNode objectNode) {
        JsonNode subscriptionLine = findSubscriptionLineItem(objectNode);
        if (subscriptionLine != null) {
            OffsetDateTime fromLine = timestampFromNode(subscriptionLine.path("period").path("start"));
            if (fromLine != null) {
                return fromLine;
            }
        }
        return extractTimestamp(objectNode, "period_start");
    }

    private OffsetDateTime extractInvoicePeriodEnd(JsonNode objectNode) {
        JsonNode subscriptionLine = findSubscriptionLineItem(objectNode);
        if (subscriptionLine != null) {
            OffsetDateTime fromLine = timestampFromNode(subscriptionLine.path("period").path("end"));
            if (fromLine != null) {
                return fromLine;
            }
        }
        return extractTimestamp(objectNode, "period_end");
    }

    private JsonNode findSubscriptionLineItem(JsonNode objectNode) {
        JsonNode lines = objectNode.path("lines").path("data");
        if (!lines.isArray() || lines.isEmpty()) {
            return null;
        }

        for (JsonNode line : lines) {
            if ("subscription".equalsIgnoreCase(textValue(line, "type"))) {
                return line;
            }
            if ("subscription_item_details".equalsIgnoreCase(textValue(line.path("parent"), "type"))) {
                return line;
            }
        }
        return lines.get(0);
    }

    private String extractObjectRefId(JsonNode source, String fieldName) {
        if (source == null || !StringUtils.hasText(fieldName)) {
            return null;
        }

        if ("id".equals(fieldName)) {
            return nullableTrim(source.path("id").asText(null));
        }

        JsonNode candidate = source.path(fieldName);
        if (candidate.isTextual()) {
            return nullableTrim(candidate.asText());
        }
        if (candidate.isObject()) {
            return nullableTrim(candidate.path("id").asText(null));
        }
        if (candidate.isNumber()) {
            return nullableTrim(candidate.asText());
        }
        return null;
    }

    private String metadataText(JsonNode metadata, String fieldName) {
        if (metadata == null || !metadata.isObject()) {
            return null;
        }
        JsonNode candidate = metadata.path(fieldName);
        if (candidate.isTextual() || candidate.isNumber() || candidate.isBoolean()) {
            return nullableTrim(candidate.asText());
        }
        return null;
    }

    private String textValue(JsonNode source, String fieldName) {
        if (source == null || !StringUtils.hasText(fieldName)) {
            return null;
        }

        JsonNode candidate = source.path(fieldName);
        if (candidate.isTextual() || candidate.isNumber() || candidate.isBoolean()) {
            return nullableTrim(candidate.asText());
        }
        return null;
    }

    private Long longValue(JsonNode source, String fieldName) {
        if (source == null || !StringUtils.hasText(fieldName)) {
            return null;
        }
        JsonNode candidate = source.path(fieldName);
        if (candidate.isIntegralNumber() || candidate.isFloatingPointNumber()) {
            return candidate.asLong();
        }
        if (candidate.isTextual()) {
            try {
                return Long.parseLong(candidate.asText().trim());
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private Boolean booleanValue(JsonNode source, String fieldName) {
        if (source == null || !StringUtils.hasText(fieldName)) {
            return null;
        }
        JsonNode candidate = source.path(fieldName);
        if (candidate.isBoolean()) {
            return candidate.asBoolean();
        }
        if (candidate.isTextual()) {
            return Boolean.parseBoolean(candidate.asText().trim());
        }
        return null;
    }

    private OffsetDateTime extractOccurredAt(JsonNode payloadJson) {
        OffsetDateTime occurredAt = timestampFromNode(payloadJson.path("created"));
        return occurredAt != null ? occurredAt : OffsetDateTime.now(ZoneOffset.UTC);
    }

    private OffsetDateTime extractTimestamp(JsonNode source, String fieldName) {
        if (source == null || !StringUtils.hasText(fieldName)) {
            return null;
        }
        return timestampFromNode(source.path(fieldName));
    }

    private OffsetDateTime timestampFromNode(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }

        long epochSeconds;
        if (node.isIntegralNumber() || node.isFloatingPointNumber()) {
            epochSeconds = node.asLong();
        } else if (node.isTextual()) {
            try {
                epochSeconds = Long.parseLong(node.asText().trim());
            } catch (NumberFormatException exception) {
                return null;
            }
        } else {
            return null;
        }

        if (epochSeconds <= 0L) {
            return null;
        }
        return OffsetDateTime.ofInstant(Instant.ofEpochSecond(epochSeconds), ZoneOffset.UTC);
    }

    private UUID parseUuid(String candidate, String fieldName) {
        if (!StringUtils.hasText(candidate)) {
            return null;
        }

        try {
            return UUID.fromString(candidate.trim());
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid UUID value for Stripe field: " + fieldName,
                    exception
            );
        }
    }

    private String nullableTrim(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private String firstNonBlank(String primary, String fallback) {
        return StringUtils.hasText(primary) ? primary : fallback;
    }

}
