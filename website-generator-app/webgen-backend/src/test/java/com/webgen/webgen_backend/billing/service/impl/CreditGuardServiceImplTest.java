package com.webgen.webgen_backend.billing.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.billing.entity.BillingCreditLedgerEntry;
import com.webgen.webgen_backend.billing.model.CreditBucket;
import com.webgen.webgen_backend.billing.repository.BillingCreditLedgerEntryRepository;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.List;
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
    void reserveCreditsSkipsReservationWhenDevProfileIsActive() {
        RepositoryState state = new RepositoryState(0);
        CreditGuardServiceImpl service = serviceWithProfiles(state, "dev");

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
    void reserveCreditsRejectsInsufficientBalanceWithoutWritingDebit() {
        RepositoryState state = new RepositoryState(5);
        CreditGuardServiceImpl service = serviceWithProfiles(state, "test");

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
        CreditGuardServiceImpl service = serviceWithProfiles(state, "test");

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
        CreditGuardServiceImpl service = serviceWithProfiles(state, "test");

        Optional<UUID> reservationId = service.reserveCredits(profileId, 0, "style_chat");

        assertThat(reservationId).isEmpty();
        assertThat(state.invocations).isEmpty();
        assertThat(state.savedEntries).isEmpty();
    }

    @Test
    void refundCreditsLocksProfileAndAppendsCompensatingDelta() {
        UUID reservationId = UUID.randomUUID();
        RepositoryState state = new RepositoryState(4);
        state.existingEntry = reservation(reservationId, 6);
        CreditGuardServiceImpl service = serviceWithProfiles(state, "test");

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
        CreditGuardServiceImpl service = serviceWithProfiles(state, "test");

        service.refundCredits(reservationId, "duplicate worker failure");

        assertThat(state.invocations).containsExactly(
                "find_entry",
                "lock_profile",
                "refund_exists"
        );
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

    private CreditGuardServiceImpl serviceWithProfiles(
            RepositoryState state,
            String... profiles
    ) {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles(profiles);
        return new CreditGuardServiceImpl(
                ledgerRepository(state),
                profileRepository(state),
                new ObjectMapper(),
                environment
        );
    }

    private BillingCreditLedgerEntryRepository ledgerRepository(RepositoryState state) {
        return (BillingCreditLedgerEntryRepository) Proxy.newProxyInstance(
                BillingCreditLedgerEntryRepository.class.getClassLoader(),
                new Class[]{BillingCreditLedgerEntryRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "computeBalanceByProfileId" -> {
                        state.invocations.add("compute_balance");
                        yield state.balance;
                    }
                    case "findById" -> {
                        state.invocations.add("find_entry");
                        yield Optional.ofNullable(state.existingEntry);
                    }
                    case "existsByCreditOperationIdAndReason" -> {
                        state.invocations.add("refund_exists");
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
        private BillingCreditLedgerEntry existingEntry;
        private boolean refundExists;

        private RepositoryState(int balance) {
            this.balance = balance;
        }
    }
}
