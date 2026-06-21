package com.webgen.webgen_backend.billing.service.impl;

import com.webgen.webgen_backend.billing.repository.BillingCreditLedgerEntryRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Proxy;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CreditGuardServiceImplTest {

    @Test
    void assertHasRequiredCreditsSkipsCreditChecksWhenDevProfileIsActive() {
        AtomicBoolean queriedBalance = new AtomicBoolean(false);
        CreditGuardServiceImpl service = new CreditGuardServiceImpl(
                stubLedgerRepository(0, queriedBalance),
                environmentWithProfiles("dev")
        );

        assertThatCode(() -> service.assertHasRequiredCredits(
                UUID.randomUUID(),
                1,
                "style_chat"
        )).doesNotThrowAnyException();

        assertThat(queriedBalance).isFalse();
    }

    @Test
    void assertHasRequiredCreditsStillRequiresCreditsOutsideDev() {
        AtomicBoolean queriedBalance = new AtomicBoolean(false);
        CreditGuardServiceImpl service = new CreditGuardServiceImpl(
                stubLedgerRepository(0, queriedBalance),
                environmentWithProfiles("test")
        );

        assertThatThrownBy(() -> service.assertHasRequiredCredits(
                UUID.randomUUID(),
                1,
                "style_chat"
        ))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.PAYMENT_REQUIRED)
                );

        assertThat(queriedBalance).isTrue();
    }

    private MockEnvironment environmentWithProfiles(String... profiles) {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles(profiles);
        return environment;
    }

    private BillingCreditLedgerEntryRepository stubLedgerRepository(
            Integer balance,
            AtomicBoolean queriedBalance
    ) {
        return (BillingCreditLedgerEntryRepository) Proxy.newProxyInstance(
                BillingCreditLedgerEntryRepository.class.getClassLoader(),
                new Class[]{BillingCreditLedgerEntryRepository.class},
                (proxy, method, args) -> {
                    if ("computeBalanceByProfileId".equals(method.getName())) {
                        queriedBalance.set(true);
                        return balance;
                    }
                    return handleObjectMethod(proxy, method.getName(), args);
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
}
