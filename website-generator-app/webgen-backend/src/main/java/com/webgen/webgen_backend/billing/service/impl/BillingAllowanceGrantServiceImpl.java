package com.webgen.webgen_backend.billing.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.billing.config.StripeProperties;
import com.webgen.webgen_backend.billing.entity.BillingCreditLedgerEntry;
import com.webgen.webgen_backend.billing.entity.BillingSubscription;
import com.webgen.webgen_backend.billing.model.CreditBucket;
import com.webgen.webgen_backend.billing.model.webhook.StripeInvoiceSnapshotModel;
import com.webgen.webgen_backend.billing.model.webhook.StripeWebhookEventType;
import com.webgen.webgen_backend.billing.repository.BillingCreditLedgerEntryRepository;
import com.webgen.webgen_backend.billing.repository.BillingSubscriptionRepository;
import com.webgen.webgen_backend.billing.service.BillingAllowanceGrantService;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillingAllowanceGrantServiceImpl implements BillingAllowanceGrantService {

    private static final String PLAN_WEBSITE_GENERATOR_PRO = "website_generator_pro";
    private static final String REASON_ALLOWANCE_GRANT = "allowance_grant";
    private static final String SOURCE_SUBSCRIPTION = "subscription";
    private static final int MAX_ALLOWANCE_WINDOWS_PER_SUBSCRIPTION_PERIOD = 120;

    private static final List<String> GRANT_ELIGIBLE_STATUSES = List.of("trialing", "active");
    private static final List<AllowancePolicy> PRO_ALLOWANCES = List.of(
            new AllowancePolicy(CreditBucket.PORTFOLIO_GENERATION, 3),
            new AllowancePolicy(CreditBucket.PORTFOLIO_REFINEMENT, 3),
            new AllowancePolicy(CreditBucket.ASSET_VERIFICATION, 50)
    );

    private final BillingSubscriptionRepository billingSubscriptionRepository;
    private final BillingCreditLedgerEntryRepository billingCreditLedgerEntryRepository;
    private final ProfileRepository profileRepository;
    private final StripeProperties stripeProperties;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void applyPaidInvoiceAllowances(StripeInvoiceSnapshotModel snapshot) {
        if (snapshot == null || snapshot.getEventType() != StripeWebhookEventType.INVOICE_PAID) {
            return;
        }

        String stripeSubscriptionId = requireText(
                snapshot.getStripeSubscriptionId(),
                "Stripe subscription id is required for allowance grants"
        );
        String stripeEventId = requireText(
                snapshot.getStripeEventId(),
                "Stripe event id is required for allowance grants"
        );
        BillingSubscription subscription = billingSubscriptionRepository
                .findByStripeSubscriptionId(stripeSubscriptionId)
                .orElseThrow(() -> new IllegalStateException(
                        "Subscription mirror missing after paid invoice sync: "
                                + stripeSubscriptionId
                ));

        OffsetDateTime activeAt = firstNonNull(
                snapshot.getCurrentPeriodStart(),
                firstNonNull(snapshot.getOccurredAt(), nowUtc())
        );
        materializeAllowances(subscription, activeAt, stripeEventId);
    }

    @Override
    @Transactional
    public void ensureCurrentSubscriptionAllowances(UUID profileId, OffsetDateTime activeAt) {
        if (profileId == null) {
            throw new IllegalArgumentException("Profile id is required for allowance grants");
        }

        billingSubscriptionRepository
                .findFirstByProfile_IdAndPlanKeyAndStatusInOrderByCurrentPeriodEndDesc(
                        profileId,
                        PLAN_WEBSITE_GENERATOR_PRO,
                        GRANT_ELIGIBLE_STATUSES
                )
                .ifPresent(subscription -> materializeAllowances(
                        subscription,
                        firstNonNull(activeAt, nowUtc()),
                        null
                ));
    }

    private void materializeAllowances(
            BillingSubscription subscription,
            OffsetDateTime activeAt,
            String stripeEventId
    ) {
        if (!isEligibleProSubscription(subscription)) {
            return;
        }

        Optional<AllowanceWindow> windowOptional = resolveAllowanceWindow(subscription, activeAt);
        if (windowOptional.isEmpty()) {
            return;
        }

        AllowanceWindow window = windowOptional.orElseThrow();
        Profile profile = profileRepository.findByIdForUpdate(subscription.getProfile().getId())
                .orElseThrow(() -> new IllegalStateException(
                        "Profile for subscription allowance grant not found: "
                                + subscription.getProfile().getId()
                ));

        for (AllowancePolicy policy : PRO_ALLOWANCES) {
            String grantKey = buildGrantKey(subscription, window, policy.creditBucket());
            if (billingCreditLedgerEntryRepository.findByGrantKey(grantKey).isPresent()) {
                continue;
            }

            BillingCreditLedgerEntry grant = new BillingCreditLedgerEntry();
            grant.setId(UUID.randomUUID());
            grant.setProfile(profile);
            grant.setDeltaCredits(policy.units());
            grant.setReason(REASON_ALLOWANCE_GRANT);
            grant.setStripeEventId(normalizeNullable(stripeEventId));
            grant.setCheckoutSessionId(null);
            grant.setCreditOperationId(null);
            grant.setCreditBucket(policy.creditBucket());
            grant.setValidFrom(window.validFrom());
            grant.setExpiresAt(window.expiresAt());
            grant.setGrantEntry(null);
            grant.setGrantKey(grantKey);
            grant.setMetadata(buildGrantMetadata(subscription, window, policy));
            grant.setCreatedAt(nowUtc());

            billingCreditLedgerEntryRepository.save(grant);
        }
    }

    private Optional<AllowanceWindow> resolveAllowanceWindow(
            BillingSubscription subscription,
            OffsetDateTime activeAt
    ) {
        OffsetDateTime subscriptionPeriodStart = subscription.getCurrentPeriodStart();
        OffsetDateTime subscriptionPeriodEnd = subscription.getCurrentPeriodEnd();
        if (subscriptionPeriodStart == null
                || subscriptionPeriodEnd == null
                || !subscriptionPeriodEnd.isAfter(subscriptionPeriodStart)
                || activeAt.isBefore(subscriptionPeriodStart)
                || !activeAt.isBefore(subscriptionPeriodEnd)) {
            return Optional.empty();
        }

        for (int monthIndex = 0;
             monthIndex < MAX_ALLOWANCE_WINDOWS_PER_SUBSCRIPTION_PERIOD;
             monthIndex++) {
            OffsetDateTime windowStart = subscriptionPeriodStart.plusMonths(monthIndex);
            if (!windowStart.isBefore(subscriptionPeriodEnd)) {
                break;
            }

            OffsetDateTime candidateEnd = subscriptionPeriodStart.plusMonths(monthIndex + 1L);
            OffsetDateTime windowEnd = candidateEnd.isBefore(subscriptionPeriodEnd)
                    ? candidateEnd
                    : subscriptionPeriodEnd;
            if (!activeAt.isBefore(windowStart) && activeAt.isBefore(windowEnd)) {
                return Optional.of(new AllowanceWindow(windowStart, windowEnd));
            }
        }

        throw new IllegalStateException(
                "Subscription period exceeds supported monthly allowance windows: "
                        + subscription.getStripeSubscriptionId()
        );
    }

    private boolean isEligibleProSubscription(BillingSubscription subscription) {
        if (subscription == null
                || !PLAN_WEBSITE_GENERATOR_PRO.equals(subscription.getPlanKey())
                || !GRANT_ELIGIBLE_STATUSES.contains(normalizeLower(subscription.getStatus()))) {
            return false;
        }

        String priceId = subscription.getPriceId();
        return matchesConfiguredPrice(
                priceId,
                stripeProperties.getPrice().getWebsiteGeneratorProMonthly()
        ) || matchesConfiguredPrice(
                priceId,
                stripeProperties.getPrice().getWebsiteGeneratorProAnnual()
        );
    }

    private boolean matchesConfiguredPrice(String candidate, String configured) {
        return StringUtils.hasText(candidate)
                && StringUtils.hasText(configured)
                && candidate.trim().equals(configured.trim());
    }

    private String buildGrantKey(
            BillingSubscription subscription,
            AllowanceWindow window,
            CreditBucket creditBucket
    ) {
        return SOURCE_SUBSCRIPTION
                + ":" + subscription.getStripeSubscriptionId()
                + ":" + window.validFrom().toInstant()
                + ":" + creditBucket.databaseValue();
    }

    private ObjectNode buildGrantMetadata(
            BillingSubscription subscription,
            AllowanceWindow window,
            AllowancePolicy policy
    ) {
        ObjectNode metadata = objectMapper.createObjectNode();
        metadata.put("source_type", SOURCE_SUBSCRIPTION);
        metadata.put("plan_key", subscription.getPlanKey());
        metadata.put("stripe_subscription_id", subscription.getStripeSubscriptionId());
        metadata.put("price_id", subscription.getPriceId());
        metadata.put("credit_bucket", policy.creditBucket().databaseValue());
        metadata.put("units_granted", policy.units());
        metadata.put("allowance_period_start", window.validFrom().toString());
        metadata.put("allowance_period_end", window.expiresAt().toString());
        metadata.put("subscription_period_start", subscription.getCurrentPeriodStart().toString());
        metadata.put("subscription_period_end", subscription.getCurrentPeriodEnd().toString());
        return metadata;
    }

    private String requireText(String value, String message) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }

    private String normalizeNullable(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String normalizeLower(String value) {
        return StringUtils.hasText(value) ? value.trim().toLowerCase(Locale.ROOT) : "";
    }

    private OffsetDateTime nowUtc() {
        return OffsetDateTime.now(ZoneOffset.UTC);
    }

    private OffsetDateTime firstNonNull(OffsetDateTime preferred, OffsetDateTime fallback) {
        return preferred != null ? preferred : fallback;
    }

    private record AllowancePolicy(CreditBucket creditBucket, int units) {
    }

    private record AllowanceWindow(OffsetDateTime validFrom, OffsetDateTime expiresAt) {
    }
}
