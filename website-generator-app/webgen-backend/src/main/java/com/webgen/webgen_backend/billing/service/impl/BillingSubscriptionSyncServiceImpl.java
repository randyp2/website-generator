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

        // --- Find existing mirrored subscription row or initialize a new one.
        BillingSubscription subscription = billingSubscriptionRepository
                .findByStripeSubscriptionId(stripeSubscriptionId)
                .orElseGet(BillingSubscription::new);

        OffsetDateTime now = nowUtc();
        if (subscription.getId() == null) {
            subscription.setId(UUID.randomUUID());
            subscription.setCreatedAt(firstNonNull(
                    snapshot != null ? snapshot.getOccurredAt() : null,
                    now
            ));
        }

        // --- Apply identifiers and core lifecycle fields from the Stripe snapshot.
        subscription.setProfile(profile);
        subscription.setStripeCustomerId(stripeCustomerId);
        subscription.setStripeSubscriptionId(stripeSubscriptionId);
        subscription.setStatus(status);
        subscription.setCanceledAt(snapshot != null ? snapshot.getCanceledAt() : null);

        // --- Keep period windows updated when Stripe sends them.
        if (snapshot != null && snapshot.getCurrentPeriodStart() != null) {
            subscription.setCurrentPeriodStart(snapshot.getCurrentPeriodStart());
        }
        if (snapshot != null && snapshot.getCurrentPeriodEnd() != null) {
            subscription.setCurrentPeriodEnd(snapshot.getCurrentPeriodEnd());
        }

        String existingPriceId = subscription.getPriceId();
        String resolvedPriceId = resolvePriceId(
                snapshot != null ? snapshot.getPriceId() : null,
                existingPriceId
        );
        if (!StringUtils.hasText(resolvedPriceId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Stripe subscription price id is required"
            );
        }
        subscription.setPriceId(resolvedPriceId);

        String resolvedPlanKey = resolvePlanKey(
                snapshot != null ? snapshot.getPlanKey() : null,
                resolvedPriceId,
                subscription.getPlanKey()
        );
        subscription.setPlanKey(resolvedPlanKey);

        Boolean cancelAtPeriodEnd = snapshot != null ? snapshot.getCancelAtPeriodEnd() : null;
        if (cancelAtPeriodEnd != null) {
            subscription.setCancelAtPeriodEnd(cancelAtPeriodEnd);
        } else if (subscription.getCancelAtPeriodEnd() == null) {
            subscription.setCancelAtPeriodEnd(Boolean.FALSE);
        }

        subscription.setMetadata(objectOrEmpty(snapshot != null ? snapshot.getMetadata() : null));
        subscription.setUpdatedAt(now);

        billingSubscriptionRepository.save(subscription);
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

        if (existingOptional.isPresent()) {
            BillingSubscription existing = existingOptional.get();

            // --- Update lifecycle status and billing period windows from invoice events.
            existing.setStatus(normalizedStatus);
            if (snapshot.getCurrentPeriodStart() != null) {
                existing.setCurrentPeriodStart(snapshot.getCurrentPeriodStart());
            }
            if (snapshot.getCurrentPeriodEnd() != null) {
                existing.setCurrentPeriodEnd(snapshot.getCurrentPeriodEnd());
            }

            // --- Reconcile plan and price identifiers when invoice lines include them.
            String resolvedPriceId = resolvePriceId(snapshot.getPriceId(), existing.getPriceId());
            if (StringUtils.hasText(resolvedPriceId)) {
                existing.setPriceId(resolvedPriceId);
            }
            String resolvedPlanKey = resolvePlanKey(
                    snapshot.getPlanKey(),
                    existing.getPriceId(),
                    existing.getPlanKey()
            );
            existing.setPlanKey(resolvedPlanKey);

            existing.setUpdatedAt(now);
            billingSubscriptionRepository.save(existing);
            return;
        }

        String stripeCustomerId = requireText(
                snapshot.getStripeCustomerId(),
                "Stripe customer id is required for subscription backfill"
        );
        String resolvedPriceId = requireText(
                resolvePriceId(snapshot.getPriceId(), null),
                "Stripe subscription price id is required for subscription backfill"
        );
        Profile profile = resolveProfile(snapshot.getProfileId(), stripeCustomerId);
        String resolvedPlanKey = resolvePlanKey(snapshot.getPlanKey(), resolvedPriceId, null);

        BillingSubscription backfilled = BillingSubscription.builder()
                .id(UUID.randomUUID())
                .profile(profile)
                .stripeCustomerId(stripeCustomerId)
                .stripeSubscriptionId(stripeSubscriptionId)
                .planKey(resolvedPlanKey)
                .priceId(resolvedPriceId)
                .status(normalizedStatus)
                .currentPeriodStart(snapshot.getCurrentPeriodStart())
                .currentPeriodEnd(snapshot.getCurrentPeriodEnd())
                .cancelAtPeriodEnd(Boolean.FALSE)
                .canceledAt(null)
                .metadata(objectOrEmpty(snapshot.getMetadata()))
                .createdAt(firstNonNull(snapshot.getOccurredAt(), now))
                .updatedAt(now)
                .build();

        billingSubscriptionRepository.save(backfilled);
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
