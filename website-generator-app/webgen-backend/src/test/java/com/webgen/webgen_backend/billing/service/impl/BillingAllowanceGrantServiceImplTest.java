package com.webgen.webgen_backend.billing.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.billing.config.StripeProperties;
import com.webgen.webgen_backend.billing.entity.BillingCreditLedgerEntry;
import com.webgen.webgen_backend.billing.entity.BillingSubscription;
import com.webgen.webgen_backend.billing.model.CreditBucket;
import com.webgen.webgen_backend.billing.model.webhook.StripeInvoiceSnapshotModel;
import com.webgen.webgen_backend.billing.model.webhook.StripeWebhookEventType;
import com.webgen.webgen_backend.billing.repository.BillingCreditLedgerEntryRepository;
import com.webgen.webgen_backend.billing.repository.BillingSubscriptionRepository;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

class BillingAllowanceGrantServiceImplTest {

    private static final String MONTHLY_PRICE_ID = "price_pro_monthly";
    private static final String ANNUAL_PRICE_ID = "price_pro_annual";

    private Profile profile;

    @BeforeEach
    void setUp() {
        profile = new Profile();
        profile.setId(UUID.randomUUID());
        profile.setEmail("billing@example.com");
    }

    @Test
    void ensuresThreeScopedGrantsForCurrentMonthlyPeriod() {
        OffsetDateTime periodStart = utc(2026, 7, 17);
        OffsetDateTime periodEnd = utc(2026, 8, 17);
        RepositoryState state = new RepositoryState();
        state.currentSubscription = subscription(
                MONTHLY_PRICE_ID,
                "active",
                periodStart,
                periodEnd
        );

        service(state).ensureCurrentSubscriptionAllowances(
                profile.getId(),
                periodStart.plusDays(10)
        );

        assertThat(state.savedEntries)
                .extracting(
                        BillingCreditLedgerEntry::getCreditBucket,
                        BillingCreditLedgerEntry::getDeltaCredits
                )
                .containsExactlyInAnyOrder(
                        tuple(CreditBucket.PORTFOLIO_GENERATION, 3),
                        tuple(CreditBucket.PORTFOLIO_REFINEMENT, 3),
                        tuple(CreditBucket.ASSET_VERIFICATION, 50)
                );
        assertThat(state.savedEntries).allSatisfy(grant -> {
            assertThat(grant.getProfile()).isSameAs(profile);
            assertThat(grant.getReason()).isEqualTo("allowance_grant");
            assertThat(grant.getValidFrom()).isEqualTo(periodStart);
            assertThat(grant.getExpiresAt()).isEqualTo(periodEnd);
            assertThat(grant.getGrantKey()).startsWith(
                    "subscription:" + state.currentSubscription.getStripeSubscriptionId()
            );
            assertThat(grant.getStripeEventId()).isNull();
            assertThat(grant.getGrantEntry()).isNull();
            assertThat(grant.getMetadata().path("source_type").asText())
                    .isEqualTo("subscription");
        });
    }

    @Test
    void annualSubscriptionMaterializesOnlyCurrentAnchoredMonthlyWindows() {
        OffsetDateTime annualStart = utc(2026, 1, 31);
        OffsetDateTime annualEnd = utc(2027, 1, 31);
        RepositoryState state = new RepositoryState();
        state.currentSubscription = subscription(
                ANNUAL_PRICE_ID,
                "active",
                annualStart,
                annualEnd
        );
        BillingAllowanceGrantServiceImpl service = service(state);

        service.ensureCurrentSubscriptionAllowances(
                profile.getId(),
                OffsetDateTime.of(2026, 2, 10, 0, 0, 0, 0, ZoneOffset.UTC)
        );
        service.ensureCurrentSubscriptionAllowances(
                profile.getId(),
                OffsetDateTime.of(2026, 3, 15, 0, 0, 0, 0, ZoneOffset.UTC)
        );
        service.ensureCurrentSubscriptionAllowances(
                profile.getId(),
                OffsetDateTime.of(2026, 3, 15, 0, 0, 0, 0, ZoneOffset.UTC)
        );

        assertThat(state.savedEntries).hasSize(6);
        assertThat(state.savedEntries.subList(0, 3)).allSatisfy(grant -> {
            assertThat(grant.getValidFrom()).isEqualTo(annualStart);
            assertThat(grant.getExpiresAt()).isEqualTo(utc(2026, 2, 28));
        });
        assertThat(state.savedEntries.subList(3, 6)).allSatisfy(grant -> {
            assertThat(grant.getValidFrom()).isEqualTo(utc(2026, 2, 28));
            assertThat(grant.getExpiresAt()).isEqualTo(utc(2026, 3, 31));
        });
        assertThat(state.entriesByGrantKey).hasSize(6);
    }

    @Test
    void paidInvoiceGrantsCarryStripeEventForReconciliation() {
        OffsetDateTime periodStart = utc(2026, 7, 17);
        RepositoryState state = new RepositoryState();
        BillingSubscription subscription = subscription(
                MONTHLY_PRICE_ID,
                "active",
                periodStart,
                utc(2026, 8, 17)
        );
        state.subscriptionByStripeId = subscription;
        StripeInvoiceSnapshotModel snapshot = StripeInvoiceSnapshotModel.builder()
                .stripeEventId("evt_invoice_paid")
                .eventType(StripeWebhookEventType.INVOICE_PAID)
                .stripeSubscriptionId(subscription.getStripeSubscriptionId())
                .currentPeriodStart(periodStart)
                .occurredAt(periodStart.plusMinutes(1))
                .build();

        service(state).applyPaidInvoiceAllowances(snapshot);

        assertThat(state.savedEntries).hasSize(3);
        assertThat(state.savedEntries).allSatisfy(grant ->
                assertThat(grant.getStripeEventId()).isEqualTo("evt_invoice_paid")
        );
    }

    @Test
    void doesNotGrantAllowancesForIneligibleSubscription() {
        RepositoryState state = new RepositoryState();
        state.currentSubscription = subscription(
                MONTHLY_PRICE_ID,
                "canceled",
                utc(2026, 7, 17),
                utc(2026, 8, 17)
        );

        service(state).ensureCurrentSubscriptionAllowances(
                profile.getId(),
                utc(2026, 7, 20)
        );

        assertThat(state.savedEntries).isEmpty();
        assertThat(state.profileLockCount).isZero();
    }

    private BillingAllowanceGrantServiceImpl service(RepositoryState state) {
        StripeProperties stripeProperties = new StripeProperties();
        stripeProperties.getPrice().setWebsiteGeneratorProMonthly(MONTHLY_PRICE_ID);
        stripeProperties.getPrice().setWebsiteGeneratorProAnnual(ANNUAL_PRICE_ID);
        return new BillingAllowanceGrantServiceImpl(
                subscriptionRepository(state),
                ledgerRepository(state),
                profileRepository(state),
                stripeProperties,
                new ObjectMapper()
        );
    }

    private BillingSubscription subscription(
            String priceId,
            String status,
            OffsetDateTime periodStart,
            OffsetDateTime periodEnd
    ) {
        return BillingSubscription.builder()
                .id(UUID.randomUUID())
                .profile(profile)
                .stripeCustomerId("cus_test")
                .stripeSubscriptionId("sub_" + UUID.randomUUID())
                .planKey("website_generator_pro")
                .priceId(priceId)
                .status(status)
                .currentPeriodStart(periodStart)
                .currentPeriodEnd(periodEnd)
                .build();
    }

    private BillingSubscriptionRepository subscriptionRepository(RepositoryState state) {
        return repositoryProxy(
                BillingSubscriptionRepository.class,
                (methodName, args) -> switch (methodName) {
                    case "findByStripeSubscriptionId" -> Optional.ofNullable(
                            state.subscriptionByStripeId
                    );
                    case "findFirstByProfile_IdAndPlanKeyAndStatusInOrderByCurrentPeriodEndDesc" ->
                            Optional.ofNullable(state.currentSubscription);
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
                        state.savedEntries.add(entry);
                        state.entriesByGrantKey.put(entry.getGrantKey(), entry);
                        yield entry;
                    }
                    default -> UNHANDLED;
                }
        );
    }

    private ProfileRepository profileRepository(RepositoryState state) {
        return repositoryProxy(
                ProfileRepository.class,
                (methodName, args) -> switch (methodName) {
                    case "findByIdForUpdate" -> {
                        state.profileLockCount++;
                        yield Optional.of(profile);
                    }
                    default -> UNHANDLED;
                }
        );
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
        private final List<BillingCreditLedgerEntry> savedEntries = new ArrayList<>();
        private final Map<String, BillingCreditLedgerEntry> entriesByGrantKey = new HashMap<>();
        private BillingSubscription currentSubscription;
        private BillingSubscription subscriptionByStripeId;
        private int profileLockCount;
    }
}
