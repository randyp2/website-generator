package com.webgen.webgen_backend.billing.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.billing.entity.BillingCreditLedgerEntry;
import com.webgen.webgen_backend.billing.entity.BillingPromotionEligibility;
import com.webgen.webgen_backend.billing.model.CreditBucket;
import com.webgen.webgen_backend.billing.repository.BillingCreditLedgerEntryRepository;
import com.webgen.webgen_backend.billing.repository.BillingPromotionEligibilityRepository;
import com.webgen.webgen_backend.billing.service.BillingEntitlementGrantService;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillingEntitlementGrantServiceImpl implements BillingEntitlementGrantService {

    private static final String FREE_POLICY_KEY = "free_v1";
    private static final String LAUNCH_CAMPAIGN_KEY = "launch_access_2026";
    private static final String REASON_FREE_TIER_GRANT = "free_tier_grant";
    private static final String REASON_PROMOTION_GRANT = "promotion_grant";
    private static final int FREE_ASSET_VERIFICATION_UNITS = 15;
    private static final int LAUNCH_GENERATION_UNITS = 1;
    private static final int LAUNCH_REFINEMENT_UNITS = 1;

    private final ProfileRepository profileRepository;
    private final BillingCreditLedgerEntryRepository billingCreditLedgerEntryRepository;
    private final BillingPromotionEligibilityRepository billingPromotionEligibilityRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void ensureCurrentEntitlements(UUID profileId, OffsetDateTime activeAt) {
        if (profileId == null) {
            throw new IllegalArgumentException("Profile id is required for entitlement grants");
        }

        Profile profile = profileRepository.findByIdForUpdate(profileId)
                .orElseThrow(() -> new IllegalStateException(
                        "Profile for entitlement grant not found: " + profileId
                ));
        OffsetDateTime grantedAt = activeAt != null ? activeAt : nowUtc();

        ensureFreeVerificationGrant(profile, grantedAt);
        claimLaunchPromotion(profile, grantedAt);
    }

    private void ensureFreeVerificationGrant(Profile profile, OffsetDateTime grantedAt) {
        String grantKey = "free:" + FREE_POLICY_KEY
                + ":" + profile.getId()
                + ":" + CreditBucket.ASSET_VERIFICATION.databaseValue();
        if (billingCreditLedgerEntryRepository.findByGrantKey(grantKey).isPresent()) {
            return;
        }

        ObjectNode metadata = objectMapper.createObjectNode();
        metadata.put("source_type", "free_tier");
        metadata.put("policy_key", FREE_POLICY_KEY);
        metadata.put("credit_bucket", CreditBucket.ASSET_VERIFICATION.databaseValue());
        metadata.put("units_granted", FREE_ASSET_VERIFICATION_UNITS);

        appendGrant(
                profile,
                FREE_ASSET_VERIFICATION_UNITS,
                CreditBucket.ASSET_VERIFICATION,
                REASON_FREE_TIER_GRANT,
                grantKey,
                metadata,
                grantedAt
        );
    }

    private void claimLaunchPromotion(Profile profile, OffsetDateTime grantedAt) {
        String normalizedEmail = normalizeEmail(profile.getEmail());
        if (normalizedEmail == null) {
            return;
        }

        BillingPromotionEligibility eligibility = billingPromotionEligibilityRepository
                .findForClaim(LAUNCH_CAMPAIGN_KEY, normalizedEmail)
                .orElse(null);
        if (eligibility == null) {
            return;
        }

        if (eligibility.getClaimedAt() != null) {
            Profile claimedProfile = eligibility.getClaimedProfile();
            if (claimedProfile != null && profile.getId().equals(claimedProfile.getId())) {
                ensureLaunchPromotionGrants(profile, eligibility, eligibility.getClaimedAt());
            }
            return;
        }

        if (billingPromotionEligibilityRepository
                .existsByCampaignKeyAndClaimedProfile_Id(LAUNCH_CAMPAIGN_KEY, profile.getId())) {
            return;
        }

        ensureLaunchPromotionGrants(profile, eligibility, grantedAt);
        eligibility.setClaimedProfile(profile);
        eligibility.setClaimedAt(grantedAt);
        billingPromotionEligibilityRepository.save(eligibility);
    }

    private void ensureLaunchPromotionGrants(
            Profile profile,
            BillingPromotionEligibility eligibility,
            OffsetDateTime grantedAt
    ) {
        ensurePromotionGrant(
                profile,
                eligibility,
                CreditBucket.PORTFOLIO_GENERATION,
                LAUNCH_GENERATION_UNITS,
                grantedAt
        );
        ensurePromotionGrant(
                profile,
                eligibility,
                CreditBucket.PORTFOLIO_REFINEMENT,
                LAUNCH_REFINEMENT_UNITS,
                grantedAt
        );
    }

    private void ensurePromotionGrant(
            Profile profile,
            BillingPromotionEligibility eligibility,
            CreditBucket creditBucket,
            int units,
            OffsetDateTime grantedAt
    ) {
        String grantKey = "promotion:" + LAUNCH_CAMPAIGN_KEY
                + ":" + eligibility.getId()
                + ":" + creditBucket.databaseValue();
        if (billingCreditLedgerEntryRepository.findByGrantKey(grantKey).isPresent()) {
            return;
        }

        ObjectNode metadata = objectMapper.createObjectNode();
        metadata.put("source_type", "promotion");
        metadata.put("campaign_key", LAUNCH_CAMPAIGN_KEY);
        metadata.put("eligibility_id", eligibility.getId().toString());
        metadata.put("credit_bucket", creditBucket.databaseValue());
        metadata.put("units_granted", units);

        appendGrant(
                profile,
                units,
                creditBucket,
                REASON_PROMOTION_GRANT,
                grantKey,
                metadata,
                grantedAt
        );
    }

    private void appendGrant(
            Profile profile,
            int units,
            CreditBucket creditBucket,
            String reason,
            String grantKey,
            ObjectNode metadata,
            OffsetDateTime grantedAt
    ) {
        BillingCreditLedgerEntry grant = new BillingCreditLedgerEntry();
        grant.setId(UUID.randomUUID());
        grant.setProfile(profile);
        grant.setDeltaCredits(units);
        grant.setReason(reason);
        grant.setStripeEventId(null);
        grant.setCheckoutSessionId(null);
        grant.setCreditOperationId(null);
        grant.setCreditBucket(creditBucket);
        grant.setValidFrom(grantedAt);
        grant.setExpiresAt(null);
        grant.setGrantEntry(null);
        grant.setGrantKey(grantKey);
        grant.setMetadata(metadata);
        grant.setCreatedAt(grantedAt);
        billingCreditLedgerEntryRepository.save(grant);
    }

    private String normalizeEmail(String email) {
        if (!StringUtils.hasText(email)) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private OffsetDateTime nowUtc() {
        return OffsetDateTime.now(ZoneOffset.UTC);
    }
}
