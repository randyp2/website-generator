package com.webgen.webgen_backend.billing.service.impl;

import com.webgen.webgen_backend.billing.config.StripeProperties;
import com.webgen.webgen_backend.billing.entity.BillingSubscription;
import com.webgen.webgen_backend.billing.model.CreditBucket;
import com.webgen.webgen_backend.billing.repository.BillingCreditLedgerEntryRepository;
import com.webgen.webgen_backend.billing.repository.BillingPromotionEligibilityRepository;
import com.webgen.webgen_backend.billing.repository.BillingSubscriptionRepository;
import com.webgen.webgen_backend.billing.service.BillingAllowanceGrantService;
import com.webgen.webgen_backend.billing.service.BillingEntitlementGrantService;
import com.webgen.webgen_backend.billing.service.BillingStatusReader;
import com.webgen.webgen_backend.profile.dto.ProfileBillingDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
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
    private final BillingPromotionEligibilityRepository billingPromotionEligibilityRepository;
    private final BillingEntitlementGrantService billingEntitlementGrantService;
    private final BillingAllowanceGrantService billingAllowanceGrantService;
    private final StripeProperties stripeProperties;

    @Override
    @Transactional
    public ProfileBillingDTO read(UUID profileId) {
        if (profileId == null) {
            return null;
        }

        OffsetDateTime activeAt = OffsetDateTime.now(ZoneOffset.UTC);
        billingEntitlementGrantService.ensureCurrentEntitlements(profileId, activeAt);

        Optional<BillingSubscription> activeOptional = billingSubscriptionRepository
                .findFirstByProfile_IdAndStatusInOrderByCurrentPeriodEndDesc(
                        profileId,
                        ACTIVE_SUBSCRIPTION_STATUSES
                );
        if (activeOptional.isPresent()) {
            billingAllowanceGrantService.ensureCurrentSubscriptionAllowances(profileId, activeAt);
        }

        Integer creditBalance = billingCreditLedgerEntryRepository.computeBalanceByProfileId(profileId);
        int generationAllowance = activeAllowanceBalance(
                profileId,
                CreditBucket.PORTFOLIO_GENERATION,
                activeAt
        );
        int refinementAllowance = activeAllowanceBalance(
                profileId,
                CreditBucket.PORTFOLIO_REFINEMENT,
                activeAt
        );
        int verificationAllowance = activeAllowanceBalance(
                profileId,
                CreditBucket.ASSET_VERIFICATION,
                activeAt
        );
        String activePromotionKey = billingPromotionEligibilityRepository
                .findFirstByClaimedProfile_IdOrderByClaimedAtDesc(profileId)
                .map(eligibility -> eligibility.getCampaignKey())
                .orElse(null);

        if (activeOptional.isEmpty()
                && !StringUtils.hasText(activePromotionKey)
                && balanceOrZero(creditBalance) == 0
                && generationAllowance == 0
                && refinementAllowance == 0
                && verificationAllowance == 0) {
            return null;
        }

        ProfileBillingDTO.ProfileBillingDTOBuilder builder = ProfileBillingDTO.builder()
                .activePromotionKey(activePromotionKey)
                .creditBalance(balanceOrZero(creditBalance))
                .portfolioGenerationAllowanceRemaining(generationAllowance)
                .portfolioRefinementAllowanceRemaining(refinementAllowance)
                .assetVerificationAllowanceRemaining(verificationAllowance);

        activeOptional.ifPresent(subscription -> builder
                .activePriceKey(reversePriceIdToPriceKey(subscription.getPriceId()))
                .activePlanKey(subscription.getPlanKey())
                .status(subscription.getStatus())
                .currentPeriodEnd(subscription.getCurrentPeriodEnd())
                .cancelAt(subscription.getCancelAt())
                .cancelAtPeriodEnd(subscription.getCancelAtPeriodEnd()));

        return builder.build();
    }

    private int activeAllowanceBalance(
            UUID profileId,
            CreditBucket creditBucket,
            OffsetDateTime activeAt
    ) {
        return billingCreditLedgerEntryRepository.computeActiveAllowanceBalance(
                profileId,
                creditBucket,
                activeAt
        );
    }

    private int balanceOrZero(Integer balance) {
        return balance != null ? balance : 0;
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
