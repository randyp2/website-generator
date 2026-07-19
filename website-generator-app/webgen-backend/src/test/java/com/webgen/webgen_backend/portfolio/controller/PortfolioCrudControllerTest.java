package com.webgen.webgen_backend.portfolio.controller;

import com.webgen.webgen_backend.billing.model.CreditUsagePolicy;
import com.webgen.webgen_backend.billing.service.CreditGuardService;
import com.webgen.webgen_backend.portfolio.billing.PortfolioCreditCostPolicy;
import com.webgen.webgen_backend.portfolio.dto.crud.CreatePortfolioRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.crud.PortfolioDTO;
import com.webgen.webgen_backend.portfolio.service.crud.PortfolioCrudService;
import com.webgen.webgen_backend.shared.ratelimit.RateLimitProperties;
import com.webgen.webgen_backend.shared.ratelimit.RateLimiterService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Proxy;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PortfolioCrudControllerTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void draftCreationRequiresGenerationEligibilityWithoutReservingUsage() {
        UUID profileId = authenticate();
        PortfolioDTO expected = new PortfolioDTO();
        expected.setId(UUID.randomUUID());
        CrudState crudState = new CrudState(expected);
        RecordingCreditGuard creditGuard = new RecordingCreditGuard(false);
        RecordingRateLimiter rateLimiter = new RecordingRateLimiter();
        PortfolioCrudController controller = controller(crudState, creditGuard, rateLimiter);
        CreatePortfolioRequestDTO request = new CreatePortfolioRequestDTO();
        request.setTemplateId("blank");

        ResponseEntity<PortfolioDTO> response = controller.createDraft(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isSameAs(expected);
        assertThat(crudState.createCalled).isTrue();
        assertThat(creditGuard.profileId).isEqualTo(profileId);
        assertThat(creditGuard.policy)
                .isEqualTo(PortfolioCreditCostPolicy.GENERATE_PORTFOLIO_USAGE);
        assertThat(rateLimiter.policyName).isEqualTo("portfolio-draft");
        assertThat(rateLimiter.callerKey).isEqualTo(profileId.toString());
    }

    @Test
    void ineligibleUserIsRejectedBeforeDraftRowCreation() {
        authenticate();
        CrudState crudState = new CrudState(new PortfolioDTO());
        RecordingCreditGuard creditGuard = new RecordingCreditGuard(true);
        PortfolioCrudController controller = controller(
                crudState,
                creditGuard,
                new RecordingRateLimiter()
        );

        assertThatThrownBy(() -> controller.createDraft(new CreatePortfolioRequestDTO()))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.PAYMENT_REQUIRED)
                );
        assertThat(crudState.createCalled).isFalse();
    }

    private PortfolioCrudController controller(
            CrudState crudState,
            CreditGuardService creditGuard,
            RateLimiterService rateLimiter
    ) {
        return new PortfolioCrudController(
                portfolioCrudService(crudState),
                null,
                rateLimiter,
                creditGuard
        );
    }

    private UUID authenticate() {
        UUID profileId = UUID.randomUUID();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(profileId.toString(), null)
        );
        return profileId;
    }

    private PortfolioCrudService portfolioCrudService(CrudState state) {
        return (PortfolioCrudService) Proxy.newProxyInstance(
                PortfolioCrudService.class.getClassLoader(),
                new Class[]{PortfolioCrudService.class},
                (proxy, method, args) -> {
                    if (method.getName().equals("createDraft")) {
                        state.createCalled = true;
                        return state.response;
                    }
                    throw new UnsupportedOperationException(
                            "Unexpected portfolio service call: " + method.getName()
                    );
                }
        );
    }

    private static final class RecordingCreditGuard implements CreditGuardService {
        private final boolean reject;
        private UUID profileId;
        private CreditUsagePolicy policy;

        private RecordingCreditGuard(boolean reject) {
            this.reject = reject;
        }

        @Override
        public void assertUsageAvailable(UUID requestedProfileId, CreditUsagePolicy requestedPolicy) {
            profileId = requestedProfileId;
            policy = requestedPolicy;
            if (reject) {
                throw new ResponseStatusException(
                        HttpStatus.PAYMENT_REQUIRED,
                        "Insufficient credits for portfolio generation"
                );
            }
        }

        @Override
        public Optional<UUID> reserveCredits(UUID profileId, int credits, String operationCode) {
            throw new UnsupportedOperationException("Draft creation must not reserve usage");
        }

        @Override
        public void refundCredits(UUID reservationId, String failureReason) {
            throw new UnsupportedOperationException("Draft creation must not refund usage");
        }
    }

    private static final class RecordingRateLimiter extends RateLimiterService {
        private String policyName;
        private String callerKey;

        private RecordingRateLimiter() {
            super(null, new RateLimitProperties());
        }

        @Override
        public void check(String requestedPolicyName, String requestedCallerKey) {
            policyName = requestedPolicyName;
            callerKey = requestedCallerKey;
        }
    }

    private static final class CrudState {
        private final PortfolioDTO response;
        private boolean createCalled;

        private CrudState(PortfolioDTO response) {
            this.response = response;
        }
    }
}
