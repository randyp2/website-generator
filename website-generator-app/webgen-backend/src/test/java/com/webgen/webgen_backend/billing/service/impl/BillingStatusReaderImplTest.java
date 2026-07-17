package com.webgen.webgen_backend.billing.service.impl;

import com.webgen.webgen_backend.billing.config.StripeProperties;
import com.webgen.webgen_backend.billing.entity.BillingSubscription;
import com.webgen.webgen_backend.billing.model.CreditBucket;
import com.webgen.webgen_backend.billing.model.webhook.StripeInvoiceSnapshotModel;
import com.webgen.webgen_backend.billing.repository.BillingCreditLedgerEntryRepository;
import com.webgen.webgen_backend.billing.repository.BillingSubscriptionRepository;
import com.webgen.webgen_backend.billing.service.BillingAllowanceGrantService;
import com.webgen.webgen_backend.billing.service.BillingEntitlementGrantService;
import com.webgen.webgen_backend.profile.dto.ProfileBillingDTO;
import com.webgen.webgen_backend.profile.entity.Profile;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.EnumMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class BillingStatusReaderImplTest {

    private static final String MONTHLY_PRICE_ID = "price_pro_monthly";

    private UUID profileId;
    private Profile profile;

    @BeforeEach
    void setUp() {
        profileId = UUID.randomUUID();
        profile = new Profile();
        profile.setId(profileId);
    }

    @Test
    void returnsGeneralCreditsAndCurrentScopedAllowanceBalances() {
        RepositoryState state = new RepositoryState();
        state.generalCredits = 42;
        state.allowanceBalances.put(CreditBucket.PORTFOLIO_GENERATION, 2);
        state.allowanceBalances.put(CreditBucket.PORTFOLIO_REFINEMENT, 1);
        state.allowanceBalances.put(CreditBucket.ASSET_VERIFICATION, 49);
        state.activeSubscription = subscription();

        ProfileBillingDTO billing = service(state).read(profileId);

        assertThat(billing).isNotNull();
        assertThat(billing.getCreditBalance()).isEqualTo(42);
        assertThat(billing.getPortfolioGenerationAllowanceRemaining()).isEqualTo(2);
        assertThat(billing.getPortfolioRefinementAllowanceRemaining()).isEqualTo(1);
        assertThat(billing.getAssetVerificationAllowanceRemaining()).isEqualTo(49);
        assertThat(billing.getActivePlanKey()).isEqualTo("website_generator_pro");
        assertThat(billing.getActivePriceKey()).isEqualTo("WEBSITE_GENERATOR_PRO_MONTHLY");
        assertThat(state.entitlementProfileId).isEqualTo(profileId);
        assertThat(state.entitlementActiveAt).isNotNull();
        assertThat(state.allowanceProfileId).isEqualTo(profileId);
        assertThat(state.allowanceActiveAt).isNotNull();
    }

    @Test
    void returnsPromotionalAllowanceWithoutSubscriptionOrGeneralCredits() {
        RepositoryState state = new RepositoryState();
        state.allowanceBalances.put(CreditBucket.PORTFOLIO_GENERATION, 1);

        ProfileBillingDTO billing = service(state).read(profileId);

        assertThat(billing).isNotNull();
        assertThat(billing.getCreditBalance()).isZero();
        assertThat(billing.getPortfolioGenerationAllowanceRemaining()).isEqualTo(1);
        assertThat(billing.getPortfolioRefinementAllowanceRemaining()).isZero();
        assertThat(billing.getAssetVerificationAllowanceRemaining()).isZero();
        assertThat(billing.getActivePlanKey()).isNull();
        assertThat(state.allowanceProfileId).isNull();
    }

    @Test
    void returnsNullWhenNoBillingValueExists() {
        RepositoryState state = new RepositoryState();

        ProfileBillingDTO billing = service(state).read(profileId);

        assertThat(billing).isNull();
        assertThat(state.allowanceProfileId).isNull();
    }

    private BillingStatusReaderImpl service(RepositoryState state) {
        StripeProperties stripeProperties = new StripeProperties();
        stripeProperties.getPrice().setWebsiteGeneratorProMonthly(MONTHLY_PRICE_ID);
        return new BillingStatusReaderImpl(
                subscriptionRepository(state),
                ledgerRepository(state),
                entitlementGrantService(state),
                allowanceGrantService(state),
                stripeProperties
        );
    }

    private BillingEntitlementGrantService entitlementGrantService(RepositoryState state) {
        return (requestedProfileId, activeAt) -> {
            state.entitlementProfileId = requestedProfileId;
            state.entitlementActiveAt = activeAt;
        };
    }

    private BillingSubscription subscription() {
        return BillingSubscription.builder()
                .id(UUID.randomUUID())
                .profile(profile)
                .stripeCustomerId("cus_test")
                .stripeSubscriptionId("sub_test")
                .planKey("website_generator_pro")
                .priceId(MONTHLY_PRICE_ID)
                .status("active")
                .currentPeriodStart(utc(2026, 7, 1))
                .currentPeriodEnd(utc(2026, 8, 1))
                .build();
    }

    private BillingSubscriptionRepository subscriptionRepository(RepositoryState state) {
        return repositoryProxy(
                BillingSubscriptionRepository.class,
                (methodName, args) -> switch (methodName) {
                    case "findFirstByProfile_IdAndStatusInOrderByCurrentPeriodEndDesc" ->
                            Optional.ofNullable(state.activeSubscription);
                    default -> UNHANDLED;
                }
        );
    }

    private BillingCreditLedgerEntryRepository ledgerRepository(RepositoryState state) {
        return repositoryProxy(
                BillingCreditLedgerEntryRepository.class,
                (methodName, args) -> switch (methodName) {
                    case "computeBalanceByProfileId" -> state.generalCredits;
                    case "computeActiveAllowanceBalance" ->
                            state.allowanceBalances.getOrDefault((CreditBucket) args[1], 0);
                    default -> UNHANDLED;
                }
        );
    }

    private BillingAllowanceGrantService allowanceGrantService(RepositoryState state) {
        return new BillingAllowanceGrantService() {
            @Override
            public void applyPaidInvoiceAllowances(StripeInvoiceSnapshotModel snapshot) {
                throw new UnsupportedOperationException("Not used by billing status tests");
            }

            @Override
            public void ensureCurrentSubscriptionAllowances(
                    UUID requestedProfileId,
                    OffsetDateTime activeAt
            ) {
                state.allowanceProfileId = requestedProfileId;
                state.allowanceActiveAt = activeAt;
            }
        };
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

    private OffsetDateTime utc(int year, int month, int dayOfMonth) {
        return OffsetDateTime.of(
                year,
                month,
                dayOfMonth,
                0,
                0,
                0,
                0,
                ZoneOffset.UTC
        );
    }

    private static final Object UNHANDLED = new Object();

    @FunctionalInterface
    private interface RepositoryInvocation {
        Object invoke(String methodName, Object[] args);
    }

    private static final class RepositoryState {
        private final Map<CreditBucket, Integer> allowanceBalances =
                new EnumMap<>(CreditBucket.class);
        private BillingSubscription activeSubscription;
        private int generalCredits;
        private UUID entitlementProfileId;
        private OffsetDateTime entitlementActiveAt;
        private UUID allowanceProfileId;
        private OffsetDateTime allowanceActiveAt;
    }
}
