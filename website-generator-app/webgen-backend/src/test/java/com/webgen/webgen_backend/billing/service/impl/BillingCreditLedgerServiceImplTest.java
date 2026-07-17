package com.webgen.webgen_backend.billing.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.billing.entity.BillingCreditLedgerEntry;
import com.webgen.webgen_backend.billing.model.CreditBucket;
import com.webgen.webgen_backend.billing.model.webhook.StripeCheckoutSessionSnapshotModel;
import com.webgen.webgen_backend.billing.model.webhook.StripeInvoiceSnapshotModel;
import com.webgen.webgen_backend.billing.model.webhook.StripeWebhookEventType;
import com.webgen.webgen_backend.billing.repository.BillingCreditLedgerEntryRepository;
import com.webgen.webgen_backend.billing.service.BillingAllowanceGrantService;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class BillingCreditLedgerServiceImplTest {

    private RepositoryState state;
    private BillingCreditLedgerServiceImpl service;
    private UUID profileId;

    @BeforeEach
    void setUp() {
        profileId = UUID.randomUUID();
        Profile profile = new Profile();
        profile.setId(profileId);
        profile.setStripeCustomerId("cus_test");

        state = new RepositoryState(profile);
        service = new BillingCreditLedgerServiceImpl(
                ledgerRepository(state),
                profileRepository(state),
                unusedAllowanceGrantService(),
                new ObjectMapper()
        );
    }

    @Test
    void grantsPaidCheckoutExactlyOnce() {
        service.fulfillCheckoutSession(snapshot(
                "evt_completed",
                "cs_paid",
                StripeWebhookEventType.CHECKOUT_SESSION_COMPLETED,
                "paid",
                "CREDIT_PACK_MEDIUM"
        ));

        assertThat(state.profileLocks).isEqualTo(1);
        assertThat(state.savedEntries).hasSize(1);
        BillingCreditLedgerEntry entry = state.savedEntries.getFirst();
        assertThat(entry.getProfile()).isSameAs(state.profile);
        assertThat(entry.getDeltaCredits()).isEqualTo(500);
        assertThat(entry.getCreditBucket()).isEqualTo(CreditBucket.GENERAL);
        assertThat(entry.getReason()).isEqualTo("credit_pack_purchase");
        assertThat(entry.getStripeEventId()).isEqualTo("evt_completed");
        assertThat(entry.getCheckoutSessionId()).isEqualTo("cs_paid");
        assertThat(entry.getMetadata().path("source_event_type").asText())
                .isEqualTo("checkout.session.completed");
        assertThat(entry.getMetadata().path("payment_status").asText()).isEqualTo("paid");

        service.fulfillCheckoutSession(snapshot(
                "evt_duplicate_delivery",
                "cs_paid",
                StripeWebhookEventType.CHECKOUT_SESSION_ASYNC_PAYMENT_SUCCEEDED,
                "paid",
                "CREDIT_PACK_MEDIUM"
        ));

        assertThat(state.savedEntries).hasSize(1);
    }

    @Test
    void waitsForDelayedPaymentThenGrantsFromAsyncSuccess() {
        service.fulfillCheckoutSession(snapshot(
                "evt_unpaid",
                "cs_delayed",
                StripeWebhookEventType.CHECKOUT_SESSION_COMPLETED,
                "unpaid",
                "CREDIT_PACK_SMALL"
        ));

        assertThat(state.savedEntries).isEmpty();
        assertThat(state.profileLocks).isZero();

        service.fulfillCheckoutSession(snapshot(
                "evt_async_paid",
                "cs_delayed",
                StripeWebhookEventType.CHECKOUT_SESSION_ASYNC_PAYMENT_SUCCEEDED,
                "paid",
                "CREDIT_PACK_SMALL"
        ));

        assertThat(state.savedEntries).hasSize(1);
        BillingCreditLedgerEntry entry = state.savedEntries.getFirst();
        assertThat(entry.getDeltaCredits()).isEqualTo(100);
        assertThat(entry.getMetadata().path("source_event_type").asText())
                .isEqualTo("checkout.session.async_payment_succeeded");
    }

    @Test
    void neverGrantsFromAsyncFailureOrUnrecognizedEvent() {
        service.fulfillCheckoutSession(snapshot(
                "evt_failed",
                "cs_failed",
                StripeWebhookEventType.CHECKOUT_SESSION_ASYNC_PAYMENT_FAILED,
                "unpaid",
                "CREDIT_PACK_LARGE"
        ));
        service.fulfillCheckoutSession(snapshot(
                "evt_unknown",
                "cs_unknown",
                null,
                "paid",
                "CREDIT_PACK_LARGE"
        ));

        assertThat(state.savedEntries).isEmpty();
        assertThat(state.profileLocks).isZero();
    }

    @Test
    void grantsCheckoutThatLegitimatelyRequiresNoPayment() {
        service.fulfillCheckoutSession(snapshot(
                "evt_discounted",
                "cs_discounted",
                StripeWebhookEventType.CHECKOUT_SESSION_COMPLETED,
                "no_payment_required",
                "CREDIT_PACK_LARGE"
        ));

        assertThat(state.savedEntries).singleElement()
                .extracting(BillingCreditLedgerEntry::getDeltaCredits)
                .isEqualTo(2_000);
    }

    private StripeCheckoutSessionSnapshotModel snapshot(
            String eventId,
            String checkoutSessionId,
            StripeWebhookEventType eventType,
            String paymentStatus,
            String priceKey
    ) {
        return StripeCheckoutSessionSnapshotModel.builder()
                .stripeEventId(eventId)
                .eventType(eventType)
                .checkoutSessionId(checkoutSessionId)
                .paymentStatus(paymentStatus)
                .stripeCustomerId("cus_test")
                .profileId(profileId)
                .priceId("price_test")
                .priceKey(priceKey)
                .purchaseType("credits")
                .metadata(new ObjectMapper().createObjectNode().put("source", "test"))
                .occurredAt(OffsetDateTime.now(ZoneOffset.UTC))
                .build();
    }

    private BillingCreditLedgerEntryRepository ledgerRepository(RepositoryState state) {
        return (BillingCreditLedgerEntryRepository) Proxy.newProxyInstance(
                BillingCreditLedgerEntryRepository.class.getClassLoader(),
                new Class<?>[]{BillingCreditLedgerEntryRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "existsByStripeEventId" -> state.eventIds.contains(args[0]);
                    case "existsByCheckoutSessionIdAndReason" ->
                            state.checkoutSessionIds.contains(args[0]);
                    case "save" -> {
                        BillingCreditLedgerEntry entry = (BillingCreditLedgerEntry) args[0];
                        state.savedEntries.add(entry);
                        state.eventIds.add(entry.getStripeEventId());
                        state.checkoutSessionIds.add(entry.getCheckoutSessionId());
                        yield entry;
                    }
                    case "toString" -> "BillingCreditLedgerEntryRepositoryStub";
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> throw new UnsupportedOperationException(method.getName());
                }
        );
    }

    private ProfileRepository profileRepository(RepositoryState state) {
        return (ProfileRepository) Proxy.newProxyInstance(
                ProfileRepository.class.getClassLoader(),
                new Class<?>[]{ProfileRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "findByIdForUpdate" -> {
                        state.profileLocks++;
                        yield state.profile.getId().equals(args[0])
                                ? Optional.of(state.profile)
                                : Optional.empty();
                    }
                    case "findByStripeCustomerId" ->
                            state.profile.getStripeCustomerId().equals(args[0])
                                    ? Optional.of(state.profile)
                                    : Optional.empty();
                    case "toString" -> "ProfileRepositoryStub";
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> throw new UnsupportedOperationException(method.getName());
                }
        );
    }

    private BillingAllowanceGrantService unusedAllowanceGrantService() {
        return new BillingAllowanceGrantService() {
            @Override
            public void applyPaidInvoiceAllowances(StripeInvoiceSnapshotModel snapshot) {
                throw new UnsupportedOperationException("Not used by Checkout tests");
            }

            @Override
            public void ensureCurrentSubscriptionAllowances(
                    UUID profileId,
                    OffsetDateTime activeAt
            ) {
                throw new UnsupportedOperationException("Not used by Checkout tests");
            }
        };
    }

    private static final class RepositoryState {
        private final Profile profile;
        private final List<BillingCreditLedgerEntry> savedEntries = new ArrayList<>();
        private final Set<String> eventIds = new HashSet<>();
        private final Set<String> checkoutSessionIds = new HashSet<>();
        private int profileLocks;

        private RepositoryState(Profile profile) {
            this.profile = profile;
        }
    }
}
