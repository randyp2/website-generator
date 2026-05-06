package com.webgen.webgen_backend.billing.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.billing.config.StripeProperties;
import com.webgen.webgen_backend.billing.entity.BillingSubscription;
import com.webgen.webgen_backend.billing.model.webhook.StripeInvoiceSnapshotModel;
import com.webgen.webgen_backend.billing.model.webhook.StripeSubscriptionSnapshotModel;
import com.webgen.webgen_backend.billing.model.webhook.StripeWebhookEventType;
import com.webgen.webgen_backend.billing.repository.BillingSubscriptionRepository;
import com.webgen.webgen_backend.billing.service.BillingSubscriptionSyncService;
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
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillingSubscriptionSyncServiceImpl implements BillingSubscriptionSyncService {

    private static final String PLAN_WEBSITE_GENERATOR_PRO = "website_generator_pro";

    private final BillingSubscriptionRepository billingSubscriptionRepository;
    private final ProfileRepository profileRepository;
    private final StripeProperties stripeProperties;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void syncSubscriptionSnapshot(StripeSubscriptionSnapshotModel snapshot) {
        String stripeSubscriptionId = requireText(
                snapshot != null ? snapshot.getStripeSubscriptionId() : null,
                "Stripe subscription id is required"
        );
        String stripeCustomerId = requireText(
                snapshot != null ? snapshot.getStripeCustomerId() : null,
                "Stripe customer id is required"
        );
        String status = requireText(
                snapshot != null ? snapshot.getStatus() : null,
                "Stripe subscription status is required"
        ).toLowerCase(Locale.ROOT);

        Profile profile = resolveProfile(
                snapshot != null ? snapshot.getProfileId() : null,
                stripeCustomerId
        );

        Optional<BillingSubscription> existingOptional =
                billingSubscriptionRepository.findByStripeSubscriptionId(stripeSubscriptionId);
        BillingSubscription existing = existingOptional.orElse(null);

        OffsetDateTime now = nowUtc();
        String resolvedPriceId = resolvePriceId(
                snapshot != null ? snapshot.getPriceId() : null,
                existing != null ? existing.getPriceId() : null
        );
        if (!StringUtils.hasText(resolvedPriceId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Stripe subscription price id is required"
            );
        }

        String resolvedPlanKey = resolvePlanKey(
                snapshot != null ? snapshot.getPlanKey() : null,
                resolvedPriceId,
                existing != null ? existing.getPlanKey() : null
        );

        Boolean cancelAtPeriodEnd = snapshot != null ? snapshot.getCancelAtPeriodEnd() : null;
        if (cancelAtPeriodEnd == null) {
            cancelAtPeriodEnd = existing != null ? existing.getCancelAtPeriodEnd() : Boolean.FALSE;
        }
        OffsetDateTime cancelAt = snapshot != null ? snapshot.getCancelAt() : null;

        billingSubscriptionRepository.upsertByStripeSubscriptionId(
                UUID.randomUUID(),
                profile.getId(),
                stripeCustomerId,
                stripeSubscriptionId,
                resolvedPlanKey,
                resolvedPriceId,
                status,
                snapshot != null ? snapshot.getCurrentPeriodStart() : null,
                snapshot != null ? snapshot.getCurrentPeriodEnd() : null,
                cancelAt,
                cancelAtPeriodEnd,
                snapshot != null ? snapshot.getCanceledAt() :
                        (existing != null ? existing.getCanceledAt() : null),
                metadataJson(objectOrEmpty(snapshot != null ? snapshot.getMetadata() : null)),
                firstNonNull(existing != null ? existing.getCreatedAt() : null,
                        firstNonNull(snapshot != null ? snapshot.getOccurredAt() : null, now)),
                now
        );

        System.out.println(">>> [BillingSubSync] upserted subscription stripeSubId=" + stripeSubscriptionId
                + " status=" + status + " plan=" + resolvedPlanKey);
    }

    @Override
    @Transactional
    public void syncInvoiceSnapshot(StripeInvoiceSnapshotModel snapshot) {
        if (snapshot == null || !StringUtils.hasText(snapshot.getStripeSubscriptionId())) {
            return;
        }

        String stripeSubscriptionId = snapshot.getStripeSubscriptionId().trim();
        String normalizedStatus = resolveSubscriptionStatusFromInvoice(snapshot.getEventType());
        if (!StringUtils.hasText(normalizedStatus)) {
            return;
        }

        OffsetDateTime now = nowUtc();
        Optional<BillingSubscription> existingOptional =
                billingSubscriptionRepository.findByStripeSubscriptionId(stripeSubscriptionId);

        BillingSubscription existing = existingOptional.orElse(null);

        String stripeCustomerId = resolveText(
                snapshot.getStripeCustomerId(),
                existing != null ? existing.getStripeCustomerId() : null
        );
        if (!StringUtils.hasText(stripeCustomerId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Stripe customer id is required for invoice subscription sync"
            );
        }

        String resolvedPriceId = resolvePriceId(
                snapshot.getPriceId(),
                existing != null ? existing.getPriceId() : null
        );
        if (!StringUtils.hasText(resolvedPriceId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Stripe subscription price id is required for invoice subscription sync"
            );
        }

        String resolvedPlanKey = resolvePlanKey(
                snapshot.getPlanKey(),
                resolvedPriceId,
                existing != null ? existing.getPlanKey() : null
        );

        Profile profile;
        if (snapshot.getProfileId() != null || existing == null) {
            profile = resolveProfile(snapshot.getProfileId(), stripeCustomerId);
        } else {
            profile = existing.getProfile();
        }

        billingSubscriptionRepository.upsertByStripeSubscriptionId(
                UUID.randomUUID(),
                profile.getId(),
                stripeCustomerId,
                stripeSubscriptionId,
                resolvedPlanKey,
                resolvedPriceId,
                normalizedStatus,
                snapshot.getCurrentPeriodStart(),
                snapshot.getCurrentPeriodEnd(),
                existing != null ? existing.getCancelAt() : null,
                existing != null ? existing.getCancelAtPeriodEnd() : Boolean.FALSE,
                existing != null ? existing.getCanceledAt() : null,
                metadataJson(objectOrEmpty(snapshot.getMetadata())),
                firstNonNull(existing != null ? existing.getCreatedAt() : null,
                        firstNonNull(snapshot.getOccurredAt(), now)),
                now
        );

        if (existing == null) {
            System.out.println(">>> [BillingSubSync] invoice backfill — upserted sub row subId="
                    + stripeSubscriptionId + " status=" + normalizedStatus);
            return;
        }

        System.out.println(">>> [BillingSubSync] invoice update subId=" + stripeSubscriptionId
                + " newStatus=" + normalizedStatus);
    }

    private Profile resolveProfile(UUID profileId, String stripeCustomerId) {
        if (profileId != null) {
            return profileRepository.findById(profileId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Profile with profile id not found"
                    ));
        }

        if (!StringUtils.hasText(stripeCustomerId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Stripe customer id is required to resolve profile"
            );
        }

        return profileRepository.findByStripeCustomerId(stripeCustomerId.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Profile with stripe customer id not found"
                ));
    }

    private String resolvePriceId(String candidate, String fallback) {
        if (StringUtils.hasText(candidate)) {
            return candidate.trim();
        }
        if (StringUtils.hasText(fallback)) {
            return fallback.trim();
        }
        return null;
    }

    private String resolveText(String candidate, String fallback) {
        if (StringUtils.hasText(candidate)) {
            return candidate.trim();
        }
        if (StringUtils.hasText(fallback)) {
            return fallback.trim();
        }
        return null;
    }

    private String resolvePlanKey(String candidate, String priceId, String fallback) {
        if (StringUtils.hasText(candidate)) {
            return candidate.trim();
        }

        if (StringUtils.hasText(priceId) && isWebsiteGeneratorProPrice(priceId.trim())) {
            return PLAN_WEBSITE_GENERATOR_PRO;
        }

        if (StringUtils.hasText(fallback)) {
            return fallback.trim();
        }

        return null;
    }

    private boolean isWebsiteGeneratorProPrice(String priceId) {
        if (!StringUtils.hasText(priceId)) {
            return false;
        }

        String normalized = priceId.trim();
        return equalsConfiguredPrice(normalized, stripeProperties.getPrice().getWebsiteGeneratorProMonthly())
                || equalsConfiguredPrice(normalized, stripeProperties.getPrice().getWebsiteGeneratorProAnnual());
    }

    private boolean equalsConfiguredPrice(String candidate, String configured) {
        return StringUtils.hasText(configured) && candidate.equals(configured.trim());
    }

    private String resolveSubscriptionStatusFromInvoice(StripeWebhookEventType eventType) {
        if (eventType == null) {
            return null;
        }

        return switch (eventType) {
            case INVOICE_PAID -> "active";
            case INVOICE_PAYMENT_FAILED -> "past_due";
            default -> null;
        };
    }

    private JsonNode objectOrEmpty(JsonNode candidate) {
        if (candidate != null && candidate.isObject()) {
            return candidate;
        }
        return objectMapper.createObjectNode();
    }

    private String metadataJson(JsonNode metadata) {
        try {
            return objectMapper.writeValueAsString(objectOrEmpty(metadata));
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to serialize subscription metadata",
                    exception
            );
        }
    }

    private String requireText(String value, String message) {
        if (!StringUtils.hasText(value)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return value.trim();
    }

    private OffsetDateTime nowUtc() {
        return OffsetDateTime.now(ZoneOffset.UTC);
    }

    private OffsetDateTime firstNonNull(OffsetDateTime preferred, OffsetDateTime fallback) {
        return preferred != null ? preferred : fallback;
    }
}
