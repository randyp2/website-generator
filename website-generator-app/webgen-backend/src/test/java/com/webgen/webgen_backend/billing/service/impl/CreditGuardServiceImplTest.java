package com.webgen.webgen_backend.billing.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.billing.config.BillingCreditProperties;
import com.webgen.webgen_backend.billing.entity.BillingCreditLedgerEntry;
import com.webgen.webgen_backend.billing.model.CreditBucket;
import com.webgen.webgen_backend.billing.model.CreditUsagePolicy;
import com.webgen.webgen_backend.billing.model.webhook.StripeInvoiceSnapshotModel;
import com.webgen.webgen_backend.billing.repository.BillingCreditLedgerEntryRepository;
import com.webgen.webgen_backend.billing.service.BillingAllowanceGrantService;
import com.webgen.webgen_backend.billing.service.BillingEntitlementGrantService;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CreditGuardServiceImplTest {

    private Profile profile;
    private UUID profileId;

    @BeforeEach
    void setUp() {
        profileId = UUID.randomUUID();
        profile = new Profile();
        profile.setId(profileId);
    }

    @Test
    void reserveCreditsSkipsReservationWhenEnforcementIsDisabled() {
        RepositoryState state = new RepositoryState(0);
        CreditGuardServiceImpl service = serviceWithEnforcement(state, false);

        Optional<UUID> reservationId = service.reserveCredits(
                profileId,
                1,
                "style_chat"
        );

        assertThat(reservationId).isEmpty();
        assertThat(state.invocations).isEmpty();
        assertThat(state.savedEntries).isEmpty();
    }

    @Test
    void availabilityCheckSkipsBillingReadsWhenEnforcementIsDisabled() {
        RepositoryState state = new RepositoryState(0);
        CreditGuardServiceImpl service = serviceWithEnforcement(state, false);

        service.assertUsageAvailable(
                profileId,
                new CreditUsagePolicy(
                        CreditBucket.PORTFOLIO_GENERATION,
                        10,
                        "portfolio_generation"
                )
        );

        assertThat(state.invocations).isEmpty();
        assertThat(state.savedEntries).isEmpty();
    }

    @Test
    void availabilityCheckAcceptsAnActiveAllowanceWithoutConsumingIt() {
        RepositoryState state = new RepositoryState(0);
        BillingCreditLedgerEntry grant = allowanceGrant(
                CreditBucket.PORTFOLIO_GENERATION,
                1
        );
        state.activeGrants.add(grant);
        state.grantBalances.put(grant.getId(), 1);
        CreditGuardServiceImpl service = serviceWithEnforcement(state, true);

        service.assertUsageAvailable(
                profileId,
                new CreditUsagePolicy(
                        CreditBucket.PORTFOLIO_GENERATION,
                        10,
                        "portfolio_generation"
                )
        );

        assertThat(state.invocations).containsExactly(
                "ensure_entitlements",
                "ensure_subscription_allowances",
                "compute_active_allowance_balance"
        );
        assertThat(state.requestedBucket).isEqualTo(CreditBucket.PORTFOLIO_GENERATION);
        assertThat(state.savedEntries).isEmpty();
    }

    @Test
    void availabilityCheckAcceptsEnoughGeneralCreditsWithoutConsumingThem() {
        RepositoryState state = new RepositoryState(10);
        CreditGuardServiceImpl service = serviceWithEnforcement(state, true);

        service.assertUsageAvailable(
                profileId,
                new CreditUsagePolicy(
                        CreditBucket.PORTFOLIO_GENERATION,
                        10,
                        "portfolio_generation"
                )
        );

        assertThat(state.invocations).containsExactly(
                "ensure_entitlements",
                "ensure_subscription_allowances",
                "compute_active_allowance_balance",
                "compute_balance"
        );
        assertThat(state.savedEntries).isEmpty();
    }

    @Test
    void availabilityCheckRejectsWhenNoGenerationFundingIsAvailable() {
        RepositoryState state = new RepositoryState(9);
        CreditGuardServiceImpl service = serviceWithEnforcement(state, true);

        assertThatThrownBy(() -> service.assertUsageAvailable(
                profileId,
                new CreditUsagePolicy(
                        CreditBucket.PORTFOLIO_GENERATION,
                        10,
                        "portfolio_generation"
                )
        )).isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
            assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.PAYMENT_REQUIRED);
            assertThat(exception.getReason()).contains("Required: 10, available: 9");
        });

        assertThat(state.invocations).containsExactly(
                "ensure_entitlements",
                "ensure_subscription_allowances",
                "compute_active_allowance_balance",
                "compute_balance"
        );
        assertThat(state.savedEntries).isEmpty();
    }

    @Test
    void reserveCreditsRejectsInsufficientBalanceWithoutWritingDebit() {
        RepositoryState state = new RepositoryState(5);
        CreditGuardServiceImpl service = serviceWithEnforcement(state, true);

        assertThatThrownBy(() -> service.reserveCredits(
                profileId,
                6,
                "refine_build"
        )).isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
            assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.PAYMENT_REQUIRED);
            assertThat(exception.getReason()).contains("Required: 6, available: 5");
        });

        assertThat(state.invocations).containsExactly("lock_profile", "compute_balance");
        assertThat(state.savedEntries).isEmpty();
    }

    @Test
    void reserveCreditsLocksProfileAndAppendsNegativeLedgerDelta() {
        RepositoryState state = new RepositoryState(10);
        CreditGuardServiceImpl service = serviceWithEnforcement(state, true);

        UUID reservationId = service.reserveCredits(profileId, 6, "refine_build").orElseThrow();

        assertThat(state.invocations).containsExactly(
                "lock_profile",
                "compute_balance",
                "save_entry"
        );

        BillingCreditLedgerEntry entry = state.savedEntries.getFirst();
        assertThat(entry).isNotNull();
        assertThat(entry.getId()).isEqualTo(reservationId);
        assertThat(entry.getCreditOperationId()).isEqualTo(reservationId);
        assertThat(entry.getProfile()).isSameAs(profile);
        assertThat(entry.getDeltaCredits()).isEqualTo(-6);
        assertThat(entry.getCreditBucket()).isEqualTo(CreditBucket.GENERAL);
        assertThat(entry.getReason()).isEqualTo("credit_reservation");
        assertThat(entry.getStripeEventId()).isNull();
        assertThat(entry.getCheckoutSessionId()).isNull();
        assertThat(entry.getCreatedAt()).isNotNull();
        assertThat(entry.getMetadata().path("operation_code").asText()).isEqualTo("refine_build");
        assertThat(entry.getMetadata().path("credits_reserved").asInt()).isEqualTo(6);
        assertThat(entry.getMetadata().path("balance_before").asInt()).isEqualTo(10);
        assertThat(entry.getMetadata().path("balance_after").asInt()).isEqualTo(4);
    }

    @Test
    void reserveCreditsSkipsNonPositiveAmounts() {
        RepositoryState state = new RepositoryState(10);
        CreditGuardServiceImpl service = serviceWithEnforcement(state, true);

        Optional<UUID> reservationId = service.reserveCredits(profileId, 0, "style_chat");

        assertThat(reservationId).isEmpty();
        assertThat(state.invocations).isEmpty();
        assertThat(state.savedEntries).isEmpty();
    }

    @Test
    void reserveUsageSkipsReservationWhenEnforcementIsDisabled() {
        RepositoryState state = new RepositoryState(0);
        CreditGuardServiceImpl service = serviceWithEnforcement(state, false);

        Optional<UUID> reservationId = service.reserveUsage(
                profileId,
                CreditBucket.PORTFOLIO_GENERATION,
                10,
                "portfolio_generation"
        );

        assertThat(reservationId).isEmpty();
        assertThat(state.invocations).isEmpty();
        assertThat(state.savedEntries).isEmpty();
    }

    @Test
    void reserveUsagePrefersActiveAllowanceOverGeneralCredits() {
        RepositoryState state = new RepositoryState(100);
        BillingCreditLedgerEntry grant = allowanceGrant(
                CreditBucket.PORTFOLIO_GENERATION,
                3
        );
        state.activeGrants.add(grant);
        state.grantBalances.put(grant.getId(), 3);
        CreditGuardServiceImpl service = serviceWithEnforcement(state, true);

        UUID reservationId = service.reserveUsage(
                profileId,
                new CreditUsagePolicy(
                        CreditBucket.PORTFOLIO_GENERATION,
                        10,
                        "portfolio_generation"
                )
        ).orElseThrow();

        assertThat(state.invocations).containsExactly(
                "ensure_entitlements",
                "ensure_subscription_allowances",
                "lock_profile",
                "find_active_grants",
                "compute_grant_balance",
                "save_entry"
        );
        assertThat(state.requestedBucket).isEqualTo(CreditBucket.PORTFOLIO_GENERATION);

        BillingCreditLedgerEntry reservation = state.savedEntries.getFirst();
        assertThat(reservation.getId()).isEqualTo(reservationId);
        assertThat(reservation.getDeltaCredits()).isEqualTo(-1);
        assertThat(reservation.getReason()).isEqualTo("allowance_reservation");
        assertThat(reservation.getCreditBucket()).isEqualTo(CreditBucket.PORTFOLIO_GENERATION);
        assertThat(reservation.getGrantEntry()).isSameAs(grant);
        assertThat(reservation.getCreditOperationId()).isEqualTo(reservationId);
        assertThat(reservation.getMetadata().path("allowance_units_reserved").asInt())
                .isEqualTo(1);
        assertThat(reservation.getMetadata().path("balance_before").asInt()).isEqualTo(3);
        assertThat(reservation.getMetadata().path("balance_after").asInt()).isEqualTo(2);
    }

    @Test
    void reserveUsageSkipsExhaustedGrantBeforeUsingNextGrant() {
        RepositoryState state = new RepositoryState(100);
        BillingCreditLedgerEntry exhaustedGrant = allowanceGrant(
                CreditBucket.PORTFOLIO_REFINEMENT,
                2
        );
        BillingCreditLedgerEntry availableGrant = allowanceGrant(
                CreditBucket.PORTFOLIO_REFINEMENT,
                3
        );
        state.activeGrants.add(exhaustedGrant);
        state.activeGrants.add(availableGrant);
        state.grantBalances.put(exhaustedGrant.getId(), 0);
        state.grantBalances.put(availableGrant.getId(), 2);
        CreditGuardServiceImpl service = serviceWithEnforcement(state, true);

        service.reserveUsage(
                profileId,
                CreditBucket.PORTFOLIO_REFINEMENT,
                6,
                "portfolio_refinement"
        ).orElseThrow();

        assertThat(state.invocations).containsExactly(
                "ensure_entitlements",
                "ensure_subscription_allowances",
                "lock_profile",
                "find_active_grants",
                "compute_grant_balance",
                "compute_grant_balance",
                "save_entry"
        );
        assertThat(state.savedEntries.getFirst().getGrantEntry()).isSameAs(availableGrant);
    }

    @Test
    void reserveUsageFallsBackToGeneralCreditsWhenAllowanceIsUnavailable() {
        RepositoryState state = new RepositoryState(10);
        CreditGuardServiceImpl service = serviceWithEnforcement(state, true);

        service.reserveUsage(
                profileId,
                CreditBucket.PORTFOLIO_GENERATION,
                10,
                "portfolio_generation"
        ).orElseThrow();

        assertThat(state.invocations).containsExactly(
                "ensure_entitlements",
                "ensure_subscription_allowances",
                "lock_profile",
                "find_active_grants",
                "compute_balance",
                "save_entry"
        );
        BillingCreditLedgerEntry reservation = state.savedEntries.getFirst();
        assertThat(reservation.getDeltaCredits()).isEqualTo(-10);
        assertThat(reservation.getReason()).isEqualTo("credit_reservation");
        assertThat(reservation.getCreditBucket()).isEqualTo(CreditBucket.GENERAL);
        assertThat(reservation.getGrantEntry()).isNull();
    }

    @Test
    void reserveUsageRejectsWhenAllowanceAndGeneralCreditsAreUnavailable() {
        RepositoryState state = new RepositoryState(9);
        CreditGuardServiceImpl service = serviceWithEnforcement(state, true);

        assertThatThrownBy(() -> service.reserveUsage(
                profileId,
                CreditBucket.PORTFOLIO_GENERATION,
                10,
                "portfolio_generation"
        )).isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
            assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.PAYMENT_REQUIRED);
            assertThat(exception.getReason()).contains("Required: 10, available: 9");
        });

        assertThat(state.invocations).containsExactly(
                "ensure_entitlements",
                "ensure_subscription_allowances",
                "lock_profile",
                "find_active_grants",
                "compute_balance"
        );
        assertThat(state.savedEntries).isEmpty();
    }

    @Test
    void refundCreditsLocksProfileAndAppendsCompensatingDelta() {
        UUID reservationId = UUID.randomUUID();
        RepositoryState state = new RepositoryState(4);
        state.existingEntry = reservation(reservationId, 6);
        CreditGuardServiceImpl service = serviceWithEnforcement(state, true);

        service.refundCredits(reservationId, "OpenAiException: upstream unavailable");

        assertThat(state.invocations).containsExactly(
                "find_entry",
                "lock_profile",
                "refund_exists",
                "compute_balance",
                "save_entry"
        );

        BillingCreditLedgerEntry refund = state.savedEntries.getFirst();
        assertThat(refund.getId()).isNotEqualTo(reservationId);
        assertThat(refund.getCreditOperationId()).isEqualTo(reservationId);
        assertThat(refund.getProfile()).isSameAs(profile);
        assertThat(refund.getDeltaCredits()).isEqualTo(6);
        assertThat(refund.getReason()).isEqualTo("credit_refund");
        assertThat(refund.getCreditBucket()).isEqualTo(CreditBucket.GENERAL);
        assertThat(refund.getGrantEntry()).isNull();
        assertThat(refund.getMetadata().path("reservation_id").asText())
                .isEqualTo(reservationId.toString());
        assertThat(refund.getMetadata().path("operation_code").asText()).isEqualTo("refine_build");
        assertThat(refund.getMetadata().path("failure_reason").asText())
                .isEqualTo("OpenAiException: upstream unavailable");
        assertThat(refund.getMetadata().path("credits_refunded").asInt()).isEqualTo(6);
        assertThat(refund.getMetadata().path("balance_before").asInt()).isEqualTo(4);
        assertThat(refund.getMetadata().path("balance_after").asInt()).isEqualTo(10);
    }

    @Test
    void refundCreditsDoesNotAppendDuplicateRefund() {
        UUID reservationId = UUID.randomUUID();
        RepositoryState state = new RepositoryState(4);
        state.existingEntry = reservation(reservationId, 6);
        state.refundExists = true;
        CreditGuardServiceImpl service = serviceWithEnforcement(state, true);

        service.refundCredits(reservationId, "duplicate worker failure");

        assertThat(state.invocations).containsExactly(
                "find_entry",
                "lock_profile",
                "refund_exists"
        );
        assertThat(state.savedEntries).isEmpty();
    }

    @Test
    void refundCreditsRestoresAllowanceToItsOriginalGrant() {
        UUID reservationId = UUID.randomUUID();
        RepositoryState state = new RepositoryState(100);
        BillingCreditLedgerEntry grant = allowanceGrant(
                CreditBucket.ASSET_VERIFICATION,
                15
        );
        state.grantBalances.put(grant.getId(), 14);
        state.existingEntry = allowanceReservation(reservationId, grant);
        CreditGuardServiceImpl service = serviceWithEnforcement(state, true);

        service.refundCredits(reservationId, "verification failed");

        assertThat(state.invocations).containsExactly(
                "find_entry",
                "lock_profile",
                "refund_exists",
                "compute_grant_balance",
                "save_entry"
        );
        assertThat(state.checkedRefundReason).isEqualTo("allowance_refund");

        BillingCreditLedgerEntry refund = state.savedEntries.getFirst();
        assertThat(refund.getDeltaCredits()).isEqualTo(1);
        assertThat(refund.getReason()).isEqualTo("allowance_refund");
        assertThat(refund.getCreditBucket()).isEqualTo(CreditBucket.ASSET_VERIFICATION);
        assertThat(refund.getGrantEntry()).isSameAs(grant);
        assertThat(refund.getCreditOperationId()).isEqualTo(reservationId);
        assertThat(refund.getMetadata().path("allowance_units_refunded").asInt())
                .isEqualTo(1);
        assertThat(refund.getMetadata().path("balance_before").asInt()).isEqualTo(14);
        assertThat(refund.getMetadata().path("balance_after").asInt()).isEqualTo(15);
    }

    @Test
    void refundCreditsDoesNotAppendDuplicateAllowanceRefund() {
        UUID reservationId = UUID.randomUUID();
        RepositoryState state = new RepositoryState(100);
        BillingCreditLedgerEntry grant = allowanceGrant(
                CreditBucket.PORTFOLIO_GENERATION,
                3
        );
        state.existingEntry = allowanceReservation(reservationId, grant);
        state.refundExists = true;
        CreditGuardServiceImpl service = serviceWithEnforcement(state, true);

        service.refundCredits(reservationId, "duplicate worker failure");

        assertThat(state.invocations).containsExactly(
                "find_entry",
                "lock_profile",
                "refund_exists"
        );
        assertThat(state.checkedRefundReason).isEqualTo("allowance_refund");
        assertThat(state.savedEntries).isEmpty();
    }

    private BillingCreditLedgerEntry reservation(UUID reservationId, int credits) {
        BillingCreditLedgerEntry entry = new BillingCreditLedgerEntry();
        entry.setId(reservationId);
        entry.setCreditOperationId(reservationId);
        entry.setProfile(profile);
        entry.setDeltaCredits(-credits);
        entry.setReason("credit_reservation");
        entry.setMetadata(new ObjectMapper().createObjectNode().put("operation_code", "refine_build"));
        return entry;
    }

    private BillingCreditLedgerEntry allowanceGrant(CreditBucket bucket, int units) {
        BillingCreditLedgerEntry grant = new BillingCreditLedgerEntry();
        grant.setId(UUID.randomUUID());
        grant.setProfile(profile);
        grant.setDeltaCredits(units);
        grant.setCreditBucket(bucket);
        grant.setReason("allowance_grant");
        grant.setGrantKey("test:" + grant.getId());
        grant.setMetadata(new ObjectMapper().createObjectNode());
        return grant;
    }

    private BillingCreditLedgerEntry allowanceReservation(
            UUID reservationId,
            BillingCreditLedgerEntry grant
    ) {
        BillingCreditLedgerEntry reservation = new BillingCreditLedgerEntry();
        reservation.setId(reservationId);
        reservation.setCreditOperationId(reservationId);
        reservation.setProfile(profile);
        reservation.setDeltaCredits(-1);
        reservation.setReason("allowance_reservation");
        reservation.setCreditBucket(grant.getCreditBucket());
        reservation.setGrantEntry(grant);
        reservation.setMetadata(new ObjectMapper().createObjectNode()
                .put("operation_code", "asset_verification"));
        return reservation;
    }

    private CreditGuardServiceImpl serviceWithEnforcement(
            RepositoryState state,
            boolean enforcementEnabled
    ) {
        BillingCreditProperties properties = new BillingCreditProperties();
        properties.setEnforcementEnabled(enforcementEnabled);
        return new CreditGuardServiceImpl(
                ledgerRepository(state),
                profileRepository(state),
                entitlementGrantService(state),
                allowanceGrantService(state),
                new ObjectMapper(),
                properties
        );
    }

    private BillingEntitlementGrantService entitlementGrantService(RepositoryState state) {
        return (requestedProfileId, activeAt) -> {
            state.invocations.add("ensure_entitlements");
            assertThat(requestedProfileId).isEqualTo(profileId);
            assertThat(activeAt).isNotNull();
        };
    }

    private BillingAllowanceGrantService allowanceGrantService(RepositoryState state) {
        return new BillingAllowanceGrantService() {
            @Override
            public void applyPaidInvoiceAllowances(StripeInvoiceSnapshotModel snapshot) {
                throw new UnsupportedOperationException("Not used by credit guard tests");
            }

            @Override
            public void ensureCurrentSubscriptionAllowances(
                    UUID requestedProfileId,
                    OffsetDateTime activeAt
            ) {
                state.invocations.add("ensure_subscription_allowances");
                assertThat(requestedProfileId).isEqualTo(profileId);
                assertThat(activeAt).isNotNull();
            }
        };
    }

    private BillingCreditLedgerEntryRepository ledgerRepository(RepositoryState state) {
        return (BillingCreditLedgerEntryRepository) Proxy.newProxyInstance(
                BillingCreditLedgerEntryRepository.class.getClassLoader(),
                new Class[]{BillingCreditLedgerEntryRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "computeActiveAllowanceBalance" -> {
                        state.invocations.add("compute_active_allowance_balance");
                        state.requestedBucket = (CreditBucket) args[1];
                        yield state.activeGrants.stream()
                                .mapToInt(grant -> Math.max(
                                        0,
                                        state.grantBalances.getOrDefault(grant.getId(), 0)
                                ))
                                .sum();
                    }
                    case "computeBalanceByProfileId" -> {
                        state.invocations.add("compute_balance");
                        yield state.balance;
                    }
                    case "findActiveAllowanceGrantsForUpdate" -> {
                        state.invocations.add("find_active_grants");
                        state.requestedBucket = (CreditBucket) args[1];
                        yield List.copyOf(state.activeGrants);
                    }
                    case "computeRemainingUnitsByGrantEntryId" -> {
                        state.invocations.add("compute_grant_balance");
                        yield state.grantBalances.getOrDefault((UUID) args[0], 0);
                    }
                    case "findById" -> {
                        state.invocations.add("find_entry");
                        yield Optional.ofNullable(state.existingEntry);
                    }
                    case "existsByCreditOperationIdAndReason" -> {
                        state.invocations.add("refund_exists");
                        state.checkedRefundReason = (String) args[1];
                        yield state.refundExists;
                    }
                    case "save" -> {
                        state.invocations.add("save_entry");
                        BillingCreditLedgerEntry entry = (BillingCreditLedgerEntry) args[0];
                        state.savedEntries.add(entry);
                        yield entry;
                    }
                    default -> handleObjectMethod(proxy, method.getName(), args);
                }
        );
    }

    private ProfileRepository profileRepository(RepositoryState state) {
        return (ProfileRepository) Proxy.newProxyInstance(
                ProfileRepository.class.getClassLoader(),
                new Class[]{ProfileRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "findByIdForUpdate" -> {
                        state.invocations.add("lock_profile");
                        yield Optional.of(profile);
                    }
                    default -> handleObjectMethod(proxy, method.getName(), args);
                }
        );
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

    private static final class RepositoryState {
        private final int balance;
        private final List<String> invocations = new ArrayList<>();
        private final List<BillingCreditLedgerEntry> savedEntries = new ArrayList<>();
        private final List<BillingCreditLedgerEntry> activeGrants = new ArrayList<>();
        private final Map<UUID, Integer> grantBalances = new HashMap<>();
        private BillingCreditLedgerEntry existingEntry;
        private CreditBucket requestedBucket;
        private String checkedRefundReason;
        private boolean refundExists;

        private RepositoryState(int balance) {
            this.balance = balance;
        }
    }
}
