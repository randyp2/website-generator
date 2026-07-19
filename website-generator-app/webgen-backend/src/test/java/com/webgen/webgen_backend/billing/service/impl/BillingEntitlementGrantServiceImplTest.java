package com.webgen.webgen_backend.billing.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.billing.entity.BillingCreditLedgerEntry;
import com.webgen.webgen_backend.billing.entity.BillingPromotionEligibility;
import com.webgen.webgen_backend.billing.model.CreditBucket;
import com.webgen.webgen_backend.billing.repository.BillingCreditLedgerEntryRepository;
import com.webgen.webgen_backend.billing.repository.BillingPromotionEligibilityRepository;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class BillingEntitlementGrantServiceImplTest {

    private static final OffsetDateTime GRANTED_AT = OffsetDateTime.of(
            2026,
            7,
            17,
            12,
            0,
            0,
            0,
            ZoneOffset.UTC
    );

    private UUID profileId;
    private Profile profile;

    @BeforeEach
    void setUp() {
        profileId = UUID.randomUUID();
        profile = new Profile();
        profile.setId(profileId);
    }

    @Test
    void grantsFifteenLifetimeVerificationsExactlyOnce() {
        RepositoryState state = new RepositoryState();
        BillingEntitlementGrantServiceImpl service = service(state);

        service.ensureCurrentEntitlements(profileId, GRANTED_AT);
        service.ensureCurrentEntitlements(profileId, GRANTED_AT.plusMinutes(1));

        assertThat(state.entriesByGrantKey).hasSize(1);
        BillingCreditLedgerEntry grant = state.entriesByGrantKey.values().iterator().next();
        assertThat(grant.getProfile()).isSameAs(profile);
        assertThat(grant.getCreditBucket()).isEqualTo(CreditBucket.ASSET_VERIFICATION);
        assertThat(grant.getDeltaCredits()).isEqualTo(15);
        assertThat(grant.getReason()).isEqualTo("free_tier_grant");
        assertThat(grant.getGrantKey())
                .isEqualTo("free:free_v1:" + profileId + ":asset_verification");
        assertThat(grant.getValidFrom()).isEqualTo(GRANTED_AT);
        assertThat(grant.getExpiresAt()).isNull();
        assertThat(grant.getMetadata().path("units_granted").asInt()).isEqualTo(15);
        assertThat(state.promotionLookupCount).isZero();
    }

    @Test
    void claimsLaunchEmailAndGrantsGenerationAndRefinementUnitsExactlyOnce() {
        profile.setEmail("  Launch.User@Example.COM ");
        RepositoryState state = new RepositoryState();
        state.eligibility = eligibility("launch.user@example.com");
        BillingEntitlementGrantServiceImpl service = service(state);

        service.ensureCurrentEntitlements(profileId, GRANTED_AT);
        service.ensureCurrentEntitlements(profileId, GRANTED_AT.plusMinutes(1));

        assertThat(state.requestedCampaignKey).isEqualTo("launch_access_2026");
        assertThat(state.requestedEmail).isEqualTo("launch.user@example.com");
        assertThat(state.entriesByGrantKey).hasSize(3);
        assertGrant(state, CreditBucket.PORTFOLIO_GENERATION, 1, "promotion_grant");
        assertGrant(state, CreditBucket.PORTFOLIO_REFINEMENT, 1, "promotion_grant");
        assertGrant(state, CreditBucket.ASSET_VERIFICATION, 15, "free_tier_grant");
        assertThat(state.eligibility.getClaimedProfile()).isSameAs(profile);
        assertThat(state.eligibility.getClaimedAt()).isEqualTo(GRANTED_AT);
        assertThat(state.savedEligibilityCount).isEqualTo(1);
    }

    @Test
    void doesNotClaimAnotherEmailWhenProfileAlreadyClaimedCampaign() {
        profile.setEmail("second@example.com");
        RepositoryState state = new RepositoryState();
        state.eligibility = eligibility("second@example.com");
        state.profileAlreadyClaimed = true;

        service(state).ensureCurrentEntitlements(profileId, GRANTED_AT);

        assertThat(state.entriesByGrantKey).hasSize(1);
        assertGrant(state, CreditBucket.ASSET_VERIFICATION, 15, "free_tier_grant");
        assertThat(state.eligibility.getClaimedProfile()).isNull();
        assertThat(state.eligibility.getClaimedAt()).isNull();
        assertThat(state.savedEligibilityCount).isZero();
    }

    private void assertGrant(
            RepositoryState state,
            CreditBucket creditBucket,
            int units,
            String reason
    ) {
        assertThat(state.entriesByGrantKey.values())
                .filteredOn(entry -> entry.getCreditBucket() == creditBucket)
                .singleElement()
                .satisfies(entry -> {
                    assertThat(entry.getDeltaCredits()).isEqualTo(units);
                    assertThat(entry.getReason()).isEqualTo(reason);
                    assertThat(entry.getExpiresAt()).isNull();
                });
    }

    private BillingPromotionEligibility eligibility(String normalizedEmail) {
        BillingPromotionEligibility eligibility = new BillingPromotionEligibility();
        eligibility.setId(UUID.randomUUID());
        eligibility.setCampaignKey("launch_access_2026");
        eligibility.setNormalizedEmail(normalizedEmail);
        eligibility.setMetadata(new ObjectMapper().createObjectNode());
        eligibility.setCreatedAt(GRANTED_AT.minusDays(1));
        return eligibility;
    }

    private BillingEntitlementGrantServiceImpl service(RepositoryState state) {
        return new BillingEntitlementGrantServiceImpl(
                profileRepository(state),
                ledgerRepository(state),
                promotionRepository(state),
                new ObjectMapper()
        );
    }

    private ProfileRepository profileRepository(RepositoryState state) {
        return repositoryProxy(
                ProfileRepository.class,
                (methodName, args) -> switch (methodName) {
                    case "findByIdForUpdate" -> {
                        state.profileLockCount += 1;
                        yield Optional.of(profile);
                    }
                    default -> UNHANDLED;
                }
        );
    }

    private BillingCreditLedgerEntryRepository ledgerRepository(RepositoryState state) {
        return repositoryProxy(
                BillingCreditLedgerEntryRepository.class,
                (methodName, args) -> switch (methodName) {
                    case "findByGrantKey" -> Optional.ofNullable(
                            state.entriesByGrantKey.get((String) args[0])
                    );
                    case "save" -> {
                        BillingCreditLedgerEntry entry = (BillingCreditLedgerEntry) args[0];
                        state.entriesByGrantKey.put(entry.getGrantKey(), entry);
                        yield entry;
                    }
                    default -> UNHANDLED;
                }
        );
    }

    private BillingPromotionEligibilityRepository promotionRepository(RepositoryState state) {
        return repositoryProxy(
                BillingPromotionEligibilityRepository.class,
                (methodName, args) -> switch (methodName) {
                    case "findForClaim" -> {
                        state.promotionLookupCount += 1;
                        state.requestedCampaignKey = (String) args[0];
                        state.requestedEmail = (String) args[1];
                        yield eligibilityMatches(state)
                                ? Optional.of(state.eligibility)
                                : Optional.empty();
                    }
                    case "existsByCampaignKeyAndClaimedProfile_Id" ->
                            state.profileAlreadyClaimed;
                    case "save" -> {
                        state.savedEligibilityCount += 1;
                        state.eligibility = (BillingPromotionEligibility) args[0];
                        yield state.eligibility;
                    }
                    default -> UNHANDLED;
                }
        );
    }

    private boolean eligibilityMatches(RepositoryState state) {
        return state.eligibility != null
                && state.eligibility.getCampaignKey().equals(state.requestedCampaignKey)
                && state.eligibility.getNormalizedEmail().equals(state.requestedEmail);
    }

    private <T> T repositoryProxy(Class<T> repositoryType, RepositoryInvocation invocation) {
        Object proxy = Proxy.newProxyInstance(
                repositoryType.getClassLoader(),
                new Class[]{repositoryType},
                (instance, method, args) -> {
                    Object result = invocation.invoke(method.getName(), args);
                    if (result != UNHANDLED) {
                        return result;
                    }
                    return handleObjectMethod(instance, method.getName(), args);
                }
        );
        return repositoryType.cast(proxy);
    }

    private Object handleObjectMethod(Object proxy, String methodName, Object[] args) {
        return switch (methodName) {
            case "toString" -> "proxy";
            case "hashCode" -> System.identityHashCode(proxy);
            case "equals" -> proxy == args[0];
            default -> throw new UnsupportedOperationException(
                    "Unexpected repository method invocation: " + methodName
            );
        };
    }

    private static final Object UNHANDLED = new Object();

    @FunctionalInterface
    private interface RepositoryInvocation {
        Object invoke(String methodName, Object[] args);
    }

    private static final class RepositoryState {
        private final Map<String, BillingCreditLedgerEntry> entriesByGrantKey =
                new LinkedHashMap<>();
        private BillingPromotionEligibility eligibility;
        private boolean profileAlreadyClaimed;
        private int profileLockCount;
        private int promotionLookupCount;
        private int savedEligibilityCount;
        private String requestedCampaignKey;
        private String requestedEmail;
    }
}
