package com.webgen.webgen_backend.billing.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.billing.entity.BillingCreditLedgerEntry;
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
import static org.assertj.core.api.Assertions.assertThatCode;
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
    void consumeCreditsSkipsConsumptionWhenDevProfileIsActive() {
        RepositoryState state = new RepositoryState(0);
        CreditGuardServiceImpl service = serviceWithProfiles(state, "dev");

        assertThatCode(() -> service.consumeCredits(
                profileId,
                1,
                "style_chat"
        )).doesNotThrowAnyException();

        assertThat(state.invocations).isEmpty();
        assertThat(state.savedEntry).isNull();
    }

    @Test
    void consumeCreditsRejectsInsufficientBalanceWithoutWritingDebit() {
        RepositoryState state = new RepositoryState(5);
        CreditGuardServiceImpl service = serviceWithProfiles(state, "test");

        assertThatThrownBy(() -> service.consumeCredits(
                profileId,
                6,
                "refine_build"
        )).isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
            assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.PAYMENT_REQUIRED);
            assertThat(exception.getReason()).contains("Required: 6, available: 5");
        });

        assertThat(state.invocations).containsExactly("lock_profile", "compute_balance");
        assertThat(state.savedEntry).isNull();
    }

    @Test
    void consumeCreditsLocksProfileAndAppendsNegativeLedgerDelta() {
        RepositoryState state = new RepositoryState(10);
        CreditGuardServiceImpl service = serviceWithProfiles(state, "test");

        service.consumeCredits(profileId, 6, "refine_build");

        assertThat(state.invocations).containsExactly(
                "lock_profile",
                "compute_balance",
                "save_entry"
        );

        BillingCreditLedgerEntry entry = state.savedEntry;
        assertThat(entry).isNotNull();
        assertThat(entry.getId()).isNotNull();
        assertThat(entry.getProfile()).isSameAs(profile);
        assertThat(entry.getDeltaCredits()).isEqualTo(-6);
        assertThat(entry.getReason()).isEqualTo("credit_usage");
        assertThat(entry.getStripeEventId()).isNull();
        assertThat(entry.getCheckoutSessionId()).isNull();
        assertThat(entry.getCreatedAt()).isNotNull();
        assertThat(entry.getMetadata().path("operation_code").asText()).isEqualTo("refine_build");
        assertThat(entry.getMetadata().path("credits_consumed").asInt()).isEqualTo(6);
        assertThat(entry.getMetadata().path("balance_before").asInt()).isEqualTo(10);
        assertThat(entry.getMetadata().path("balance_after").asInt()).isEqualTo(4);
    }

    @Test
    void consumeCreditsSkipsNonPositiveAmounts() {
        RepositoryState state = new RepositoryState(10);
        CreditGuardServiceImpl service = serviceWithProfiles(state, "test");

        service.consumeCredits(profileId, 0, "style_chat");

        assertThat(state.invocations).isEmpty();
        assertThat(state.savedEntry).isNull();
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
                    case "save" -> {
                        state.invocations.add("save_entry");
                        state.savedEntry = (BillingCreditLedgerEntry) args[0];
                        yield state.savedEntry;
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
        private BillingCreditLedgerEntry savedEntry;

        private RepositoryState(int balance) {
            this.balance = balance;
        }
    }
}
