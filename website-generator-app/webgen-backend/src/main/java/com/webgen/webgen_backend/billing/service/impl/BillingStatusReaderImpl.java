package com.webgen.webgen_backend.billing.service.impl;

import com.webgen.webgen_backend.billing.config.StripeProperties;
import com.webgen.webgen_backend.billing.entity.BillingSubscription;
import com.webgen.webgen_backend.billing.repository.BillingCreditLedgerEntryRepository;
import com.webgen.webgen_backend.billing.repository.BillingSubscriptionRepository;
import com.webgen.webgen_backend.billing.service.BillingStatusReader;
import com.webgen.webgen_backend.profile.dto.ProfileBillingDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillingStatusReaderImpl implements BillingStatusReader {

    private static final List<String> ACTIVE_SUBSCRIPTION_STATUSES =
            List.of("trialing", "active", "past_due");

    private final BillingSubscriptionRepository billingSubscriptionRepository;
    private final BillingCreditLedgerEntryRepository billingCreditLedgerEntryRepository;
    private final StripeProperties stripeProperties;

    @Override
    @Transactional(readOnly = true)
    public ProfileBillingDTO read(UUID profileId) {
        if (profileId == null) {
            return null;
        }

        Optional<BillingSubscription> activeOptional = billingSubscriptionRepository
                .findFirstByProfile_IdAndStatusInOrderByCurrentPeriodEndDesc(
                        profileId,
                        ACTIVE_SUBSCRIPTION_STATUSES
                );

        Integer creditBalance = billingCreditLedgerEntryRepository.computeBalanceByProfileId(profileId);

        if (activeOptional.isEmpty() && (creditBalance == null || creditBalance == 0)) {
            return null;
        }

        ProfileBillingDTO.ProfileBillingDTOBuilder builder = ProfileBillingDTO.builder()
                .creditBalance(creditBalance != null ? creditBalance : 0);

        activeOptional.ifPresent(subscription -> builder
                .activePriceKey(reversePriceIdToPriceKey(subscription.getPriceId()))
                .activePlanKey(subscription.getPlanKey())
                .status(subscription.getStatus())
                .currentPeriodEnd(subscription.getCurrentPeriodEnd())
                .cancelAt(subscription.getCancelAt())
                .cancelAtPeriodEnd(subscription.getCancelAtPeriodEnd()));

        return builder.build();
    }

    private String reversePriceIdToPriceKey(String priceId) {
        if (!StringUtils.hasText(priceId)) {
            return null;
        }
        String normalized = priceId.trim();
        StripeProperties.Price prices = stripeProperties.getPrice();

        if (matches(normalized, prices.getWebsiteGeneratorProMonthly())) return "WEBSITE_GENERATOR_PRO_MONTHLY";
        if (matches(normalized, prices.getWebsiteGeneratorProAnnual())) return "WEBSITE_GENERATOR_PRO_ANNUAL";
        if (matches(normalized, prices.getCreditPackSmall())) return "CREDIT_PACK_SMALL";
        if (matches(normalized, prices.getCreditPackMedium())) return "CREDIT_PACK_MEDIUM";
        if (matches(normalized, prices.getCreditPackLarge())) return "CREDIT_PACK_LARGE";
        return null;
    }

    private boolean matches(String candidate, String configured) {
        return StringUtils.hasText(configured) && candidate.equals(configured.trim());
    }
}
