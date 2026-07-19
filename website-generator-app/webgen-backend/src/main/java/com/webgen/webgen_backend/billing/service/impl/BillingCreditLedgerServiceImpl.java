package com.webgen.webgen_backend.billing.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.billing.dto.BillingCreditPurchaseDTO;
import com.webgen.webgen_backend.billing.entity.BillingCreditLedgerEntry;
import com.webgen.webgen_backend.billing.model.webhook.StripeCheckoutSessionSnapshotModel;
import com.webgen.webgen_backend.billing.model.webhook.StripeInvoiceSnapshotModel;
import com.webgen.webgen_backend.billing.model.webhook.StripeWebhookEventType;
import com.webgen.webgen_backend.billing.repository.BillingCreditLedgerEntryRepository;
import com.webgen.webgen_backend.billing.service.BillingAllowanceGrantService;
import com.webgen.webgen_backend.billing.service.BillingCreditLedgerService;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillingCreditLedgerServiceImpl implements BillingCreditLedgerService {

    private static final String PURCHASE_TYPE_CREDITS = "credits";
    private static final String PAYMENT_STATUS_PAID = "paid";
    private static final String PAYMENT_STATUS_NO_PAYMENT_REQUIRED = "no_payment_required";

    private static final int CREDIT_PACK_SMALL_CREDITS = 100;
    private static final int CREDIT_PACK_MEDIUM_CREDITS = 500;
    private static final int CREDIT_PACK_LARGE_CREDITS = 2000;

    private static final String REASON_CREDIT_PACK_PURCHASE = "credit_pack_purchase";
    private static final int DEFAULT_HISTORY_LIMIT = 20;
    private static final int MAX_HISTORY_LIMIT = 100;

    private final BillingCreditLedgerEntryRepository billingCreditLedgerEntryRepository;
    private final ProfileRepository profileRepository;
    private final BillingAllowanceGrantService billingAllowanceGrantService;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void fulfillCheckoutSession(StripeCheckoutSessionSnapshotModel snapshot) {
        if (snapshot == null) {
            return;
        }

        String purchaseType = normalizeLower(snapshot.getPurchaseType());
        if (!PURCHASE_TYPE_CREDITS.equals(purchaseType)) {
            System.out.println(">>> [BillingCredit] skip checkout fulfillment: purchaseType="
                    + purchaseType + " (not credits)");
            return;
        }

        if (!isConfirmedPayment(snapshot)) {
            System.out.println(">>> [BillingCredit] skip checkout fulfillment: sessionId="
                    + nullSafeText(snapshot.getCheckoutSessionId())
                    + " eventType=" + eventTypeValue(snapshot)
                    + " paymentStatus=" + normalizeLower(snapshot.getPaymentStatus()));
            return;
        }

        String stripeEventId = requireText(
                snapshot.getStripeEventId(),
                "Stripe event id is required for checkout fulfillment"
        );
        String checkoutSessionId = requireText(
                snapshot.getCheckoutSessionId(),
                "Checkout session id is required for checkout fulfillment"
        );

        Profile profile = resolveProfile(snapshot.getProfileId(), snapshot.getStripeCustomerId());

        // Profile locking serializes fulfillment for the same customer. The database
        // unique index remains the final safeguard across inconsistent event metadata.
        if (billingCreditLedgerEntryRepository.existsByStripeEventId(stripeEventId)
                || billingCreditLedgerEntryRepository.existsByCheckoutSessionIdAndReason(
                        checkoutSessionId,
                        REASON_CREDIT_PACK_PURCHASE
                )) {
            return;
        }

        int creditDelta = resolveCreditPackCredits(snapshot.getPriceKey());

        // --- Persist the append-only credit movement for reconciliation and balance derivation.
        BillingCreditLedgerEntry entry = new BillingCreditLedgerEntry();
        entry.setId(UUID.randomUUID());
        entry.setProfile(profile);
        entry.setDeltaCredits(creditDelta);
        entry.setReason(REASON_CREDIT_PACK_PURCHASE);
        entry.setStripeEventId(stripeEventId);
        entry.setCheckoutSessionId(checkoutSessionId);
        entry.setMetadata(buildCheckoutMetadata(snapshot));
        entry.setCreatedAt(firstNonNull(snapshot.getOccurredAt(), nowUtc()));

        billingCreditLedgerEntryRepository.save(entry);
        System.out.println(">>> [BillingCredit] granted +" + creditDelta
                + " credits for profile=" + profile.getId() + " (credit_pack_purchase)");
    }

    @Override
    @Transactional
    public void applyInvoicePaidAllowances(StripeInvoiceSnapshotModel snapshot) {
        billingAllowanceGrantService.applyPaidInvoiceAllowances(snapshot);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BillingCreditPurchaseDTO> listRecentCreditPurchases(
            UUID profileId,
            Integer limit
    ) {
        if (profileId == null) {
            return List.of();
        }

        int normalizedLimit = normalizeHistoryLimit(limit);
        return billingCreditLedgerEntryRepository
                .findByProfile_IdAndReasonOrderByCreatedAtDesc(
                        profileId,
                        REASON_CREDIT_PACK_PURCHASE,
                        PageRequest.of(0, normalizedLimit)
                )
                .stream()
                .map(this::toCreditPurchaseDto)
                .toList();
    }

    private Profile resolveProfile(UUID profileId, String stripeCustomerId) {
        if (profileId != null) {
            return profileRepository.findByIdForUpdate(profileId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Profile with profile id not found"
                    ));
        }

        String resolvedStripeCustomerId = requireText(
                stripeCustomerId,
                "Stripe customer id is required to resolve profile"
        );
        Profile resolvedProfile = profileRepository.findByStripeCustomerId(resolvedStripeCustomerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Profile with stripe customer id not found"
                ));
        return profileRepository.findByIdForUpdate(resolvedProfile.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Profile with profile id not found"
                ));
    }

    private int resolveCreditPackCredits(String priceKey) {
        String normalizedPriceKey = requireText(
                priceKey,
                "price_key metadata is required for credit purchases"
        ).toUpperCase(Locale.ROOT);

        return switch (normalizedPriceKey) {
            case "CREDIT_PACK_SMALL" -> CREDIT_PACK_SMALL_CREDITS;
            case "CREDIT_PACK_MEDIUM" -> CREDIT_PACK_MEDIUM_CREDITS;
            case "CREDIT_PACK_LARGE" -> CREDIT_PACK_LARGE_CREDITS;
            default -> throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unsupported credit pack price key: " + normalizedPriceKey
            );
        };
    }

    private ObjectNode buildCheckoutMetadata(StripeCheckoutSessionSnapshotModel snapshot) {
        ObjectNode metadata = objectMapper.createObjectNode();
        metadata.put("source_event_type", eventTypeValue(snapshot));
        metadata.put("payment_status", normalizeLower(snapshot.getPaymentStatus()));
        metadata.put("purchase_type", normalizeLower(snapshot.getPurchaseType()));
        metadata.put("price_key", nullSafeText(snapshot.getPriceKey()));
        metadata.put("price_id", nullSafeText(snapshot.getPriceId()));
        metadata.put("plan_key", nullSafeText(snapshot.getPlanKey()));
        metadata.put("stripe_customer_id", nullSafeText(snapshot.getStripeCustomerId()));
        metadata.put("stripe_subscription_id", nullSafeText(snapshot.getStripeSubscriptionId()));
        metadata.put("payment_intent_id", nullSafeText(snapshot.getPaymentIntentId()));
        if (snapshot.getAmountTotal() != null) {
            metadata.put("amount_total", snapshot.getAmountTotal());
        }
        metadata.put("currency", normalizeLower(snapshot.getCurrency()));

        JsonNode sourceMetadata = objectOrEmpty(snapshot.getMetadata());
        metadata.set("checkout_metadata", sourceMetadata);
        return metadata;
    }

    private BillingCreditPurchaseDTO toCreditPurchaseDto(BillingCreditLedgerEntry entry) {
        JsonNode metadata = objectOrEmpty(entry.getMetadata());
        return BillingCreditPurchaseDTO.builder()
                .ledgerEntryId(entry.getId())
                .checkoutSessionId(entry.getCheckoutSessionId())
                .paymentIntentId(nullableText(metadata, "payment_intent_id"))
                .paymentStatus(nullableText(metadata, "payment_status"))
                .priceKey(nullableText(metadata, "price_key"))
                .priceId(nullableText(metadata, "price_id"))
                .credits(entry.getDeltaCredits())
                .amountPaid(nullableLong(metadata, "amount_total"))
                .currency(nullableText(metadata, "currency"))
                .purchasedAt(entry.getCreatedAt())
                .build();
    }

    private int normalizeHistoryLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_HISTORY_LIMIT;
        }
        return Math.min(limit, MAX_HISTORY_LIMIT);
    }

    private String nullableText(JsonNode source, String fieldName) {
        if (source == null || source.isMissingNode() || source.isNull()) {
            return null;
        }
        JsonNode value = source.path(fieldName);
        if (!value.isTextual() || value.asText().isBlank()) {
            return null;
        }
        return value.asText().trim();
    }

    private Long nullableLong(JsonNode source, String fieldName) {
        if (source == null || source.isMissingNode() || source.isNull()) {
            return null;
        }
        JsonNode value = source.path(fieldName);
        return value.isIntegralNumber() ? value.asLong() : null;
    }

    private boolean isConfirmedPayment(StripeCheckoutSessionSnapshotModel snapshot) {
        StripeWebhookEventType eventType = snapshot.getEventType();
        if (eventType != StripeWebhookEventType.CHECKOUT_SESSION_COMPLETED
                && eventType != StripeWebhookEventType.CHECKOUT_SESSION_ASYNC_PAYMENT_SUCCEEDED) {
            return false;
        }

        String paymentStatus = normalizeLower(snapshot.getPaymentStatus());
        return PAYMENT_STATUS_PAID.equals(paymentStatus)
                || PAYMENT_STATUS_NO_PAYMENT_REQUIRED.equals(paymentStatus);
    }

    private String eventTypeValue(StripeCheckoutSessionSnapshotModel snapshot) {
        StripeWebhookEventType eventType = snapshot.getEventType();
        return eventType != null ? eventType.value() : "";
    }

    private JsonNode objectOrEmpty(JsonNode candidate) {
        if (candidate != null && candidate.isObject()) {
            return candidate;
        }
        return objectMapper.createObjectNode();
    }

    private String requireText(String value, String message) {
        if (!StringUtils.hasText(value)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return value.trim();
    }

    private String normalizeLower(String value) {
        return StringUtils.hasText(value) ? value.trim().toLowerCase(Locale.ROOT) : "";
    }

    private String nullSafeText(String value) {
        return StringUtils.hasText(value) ? value.trim() : "";
    }

    private OffsetDateTime nowUtc() {
        return OffsetDateTime.now(ZoneOffset.UTC);
    }

    private OffsetDateTime firstNonNull(OffsetDateTime preferred, OffsetDateTime fallback) {
        return preferred != null ? preferred : fallback;
    }
}
