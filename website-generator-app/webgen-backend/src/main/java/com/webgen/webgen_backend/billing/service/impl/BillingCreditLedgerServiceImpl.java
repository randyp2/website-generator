package com.webgen.webgen_backend.billing.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.billing.config.StripeProperties;
import com.webgen.webgen_backend.billing.entity.BillingCreditLedgerEntry;
import com.webgen.webgen_backend.billing.model.webhook.StripeCheckoutSessionCompletedModel;
import com.webgen.webgen_backend.billing.model.webhook.StripeInvoiceSnapshotModel;
import com.webgen.webgen_backend.billing.model.webhook.StripeWebhookEventType;
import com.webgen.webgen_backend.billing.repository.BillingCreditLedgerEntryRepository;
import com.webgen.webgen_backend.billing.service.BillingCreditLedgerService;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillingCreditLedgerServiceImpl implements BillingCreditLedgerService {

    private static final String PURCHASE_TYPE_CREDITS = "credits";
    private static final String PLAN_WEBSITE_GENERATOR_PRO = "website_generator_pro";

    private static final int CREDIT_PACK_SMALL_CREDITS = 100;
    private static final int CREDIT_PACK_MEDIUM_CREDITS = 500;
    private static final int CREDIT_PACK_LARGE_CREDITS = 2000;
    private static final int PRO_PLAN_MONTHLY_CREDIT_GRANT = 300;

    private static final String REASON_CREDIT_PACK_PURCHASE = "credit_pack_purchase";
    private static final String REASON_PLAN_GRANT = "plan_grant";

    private final BillingCreditLedgerEntryRepository billingCreditLedgerEntryRepository;
    private final ProfileRepository profileRepository;
    private final StripeProperties stripeProperties;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void fulfillCheckoutSessionCompleted(StripeCheckoutSessionCompletedModel snapshot) {
        if (snapshot == null) {
            return;
        }

        String purchaseType = normalizeLower(snapshot.getPurchaseType());
        if (!PURCHASE_TYPE_CREDITS.equals(purchaseType)) {
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

        // --- Prevent duplicate credit grants across Stripe retries and repeated handlers.
        if (billingCreditLedgerEntryRepository.existsByStripeEventId(stripeEventId)
                || billingCreditLedgerEntryRepository.existsByCheckoutSessionId(checkoutSessionId)) {
            return;
        }

        int creditDelta = resolveCreditPackCredits(snapshot.getPriceKey());
        Profile profile = resolveProfile(snapshot.getProfileId(), snapshot.getStripeCustomerId());

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
    }

    @Override
    @Transactional
    public void applyInvoicePaidCredits(StripeInvoiceSnapshotModel snapshot) {
        if (snapshot == null || snapshot.getEventType() != StripeWebhookEventType.INVOICE_PAID) {
            return;
        }

        String stripeEventId = requireText(
                snapshot.getStripeEventId(),
                "Stripe event id is required for invoice credit grants"
        );

        // --- Avoid granting the same period credits twice on webhook retries.
        if (billingCreditLedgerEntryRepository.existsByStripeEventId(stripeEventId)) {
            return;
        }

        String resolvedPlanKey = resolvePlanKey(snapshot.getPlanKey(), snapshot.getPriceId());
        if (!PLAN_WEBSITE_GENERATOR_PRO.equals(resolvedPlanKey)) {
            return;
        }

        Profile profile = resolveProfile(snapshot.getProfileId(), snapshot.getStripeCustomerId());

        BillingCreditLedgerEntry entry = new BillingCreditLedgerEntry();
        entry.setId(UUID.randomUUID());
        entry.setProfile(profile);
        entry.setDeltaCredits(PRO_PLAN_MONTHLY_CREDIT_GRANT);
        entry.setReason(REASON_PLAN_GRANT);
        entry.setStripeEventId(stripeEventId);
        entry.setCheckoutSessionId(null);
        entry.setMetadata(buildInvoiceMetadata(snapshot, resolvedPlanKey));
        entry.setCreatedAt(firstNonNull(snapshot.getOccurredAt(), nowUtc()));

        billingCreditLedgerEntryRepository.save(entry);
    }

    private Profile resolveProfile(UUID profileId, String stripeCustomerId) {
        if (profileId != null) {
            return profileRepository.findById(profileId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Profile with profile id not found"
                    ));
        }

        String resolvedStripeCustomerId = requireText(
                stripeCustomerId,
                "Stripe customer id is required to resolve profile"
        );
        return profileRepository.findByStripeCustomerId(resolvedStripeCustomerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Profile with stripe customer id not found"
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

    private String resolvePlanKey(String planKeyCandidate, String priceIdCandidate) {
        if (StringUtils.hasText(planKeyCandidate)) {
            return planKeyCandidate.trim();
        }

        if (!StringUtils.hasText(priceIdCandidate)) {
            return null;
        }

        String normalizedPriceId = priceIdCandidate.trim();
        if (equalsConfiguredPrice(normalizedPriceId, stripeProperties.getPrice().getWebsiteGeneratorProMonthly())
                || equalsConfiguredPrice(normalizedPriceId, stripeProperties.getPrice().getWebsiteGeneratorProAnnual())) {
            return PLAN_WEBSITE_GENERATOR_PRO;
        }
        return null;
    }

    private boolean equalsConfiguredPrice(String candidate, String configured) {
        return StringUtils.hasText(configured) && candidate.equals(configured.trim());
    }

    private ObjectNode buildCheckoutMetadata(StripeCheckoutSessionCompletedModel snapshot) {
        ObjectNode metadata = objectMapper.createObjectNode();
        metadata.put("source_event_type", StripeWebhookEventType.CHECKOUT_SESSION_COMPLETED.value());
        metadata.put("purchase_type", normalizeLower(snapshot.getPurchaseType()));
        metadata.put("price_key", nullSafeText(snapshot.getPriceKey()));
        metadata.put("price_id", nullSafeText(snapshot.getPriceId()));
        metadata.put("plan_key", nullSafeText(snapshot.getPlanKey()));
        metadata.put("stripe_customer_id", nullSafeText(snapshot.getStripeCustomerId()));
        metadata.put("stripe_subscription_id", nullSafeText(snapshot.getStripeSubscriptionId()));

        JsonNode sourceMetadata = objectOrEmpty(snapshot.getMetadata());
        metadata.set("checkout_metadata", sourceMetadata);
        return metadata;
    }

    private ObjectNode buildInvoiceMetadata(StripeInvoiceSnapshotModel snapshot, String planKey) {
        ObjectNode metadata = objectMapper.createObjectNode();
        metadata.put("source_event_type", StripeWebhookEventType.INVOICE_PAID.value());
        metadata.put("invoice_id", nullSafeText(snapshot.getInvoiceId()));
        metadata.put("billing_reason", nullSafeText(snapshot.getBillingReason()));
        metadata.put("stripe_subscription_id", nullSafeText(snapshot.getStripeSubscriptionId()));
        metadata.put("stripe_customer_id", nullSafeText(snapshot.getStripeCustomerId()));
        metadata.put("price_id", nullSafeText(snapshot.getPriceId()));
        metadata.put("plan_key", nullSafeText(planKey));
        metadata.put("currency", nullSafeText(snapshot.getCurrency()));

        if (snapshot.getAmountPaid() != null) {
            metadata.put("amount_paid", snapshot.getAmountPaid());
        } else {
            metadata.putNull("amount_paid");
        }

        if (snapshot.getCurrentPeriodStart() != null) {
            metadata.put("current_period_start", snapshot.getCurrentPeriodStart().toString());
        } else {
            metadata.putNull("current_period_start");
        }

        if (snapshot.getCurrentPeriodEnd() != null) {
            metadata.put("current_period_end", snapshot.getCurrentPeriodEnd().toString());
        } else {
            metadata.putNull("current_period_end");
        }

        metadata.set("invoice_metadata", objectOrEmpty(snapshot.getMetadata()));
        return metadata;
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
