package com.webgen.webgen_backend.billing.model;

import com.webgen.webgen_backend.billing.service.CreditGuardService;
import com.webgen.webgen_backend.portfolio.billing.PortfolioCreditCostPolicy;
import com.webgen.webgen_backend.verification.billing.VerificationCreditCostPolicy;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.tuple;

class CreditUsagePolicyTest {

    @Test
    void mapsPaidFeaturesToScopedAllowancesAndExistingFallbackCosts() {
        assertThat(List.of(
                PortfolioCreditCostPolicy.GENERATE_PORTFOLIO_USAGE,
                PortfolioCreditCostPolicy.REFINE_CLARIFY_USAGE,
                PortfolioCreditCostPolicy.REFINE_PLAN_USAGE,
                PortfolioCreditCostPolicy.REFINE_BUILD_USAGE,
                PortfolioCreditCostPolicy.STYLE_CHAT_USAGE,
                VerificationCreditCostPolicy.ASSET_VERIFICATION_USAGE
        )).extracting(
                CreditUsagePolicy::allowanceBucket,
                CreditUsagePolicy::fallbackCredits,
                CreditUsagePolicy::operationCode
        ).containsExactly(
                tuple(CreditBucket.PORTFOLIO_GENERATION, 10, "portfolio_generation"),
                tuple(CreditBucket.PORTFOLIO_REFINEMENT, 1, "refine_clarify"),
                tuple(CreditBucket.PORTFOLIO_REFINEMENT, 2, "refine_plan"),
                tuple(CreditBucket.PORTFOLIO_REFINEMENT, 6, "refine_build"),
                tuple(CreditBucket.PORTFOLIO_REFINEMENT, 1, "style_chat"),
                tuple(CreditBucket.ASSET_VERIFICATION, 1, "asset_verification")
        );
    }

    @Test
    void rejectsGeneralCreditAsAnAllowanceBucket() {
        assertThatThrownBy(() -> new CreditUsagePolicy(
                CreditBucket.GENERAL,
                1,
                "invalid_usage"
        )).isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Usage policy requires a scoped allowance bucket");
    }

    @Test
    void typedPolicyForwardsToAtomicUsageReservation() {
        UUID profileId = UUID.randomUUID();
        UUID reservationId = UUID.randomUUID();
        CreditUsagePolicy policy = PortfolioCreditCostPolicy.GENERATE_PORTFOLIO_USAGE;
        CapturingCreditGuard creditGuard = new CapturingCreditGuard(reservationId);

        Optional<UUID> result = creditGuard.reserveUsage(profileId, policy);

        assertThat(result).contains(reservationId);
        assertThat(creditGuard.profileId).isEqualTo(profileId);
        assertThat(creditGuard.allowanceBucket).isEqualTo(policy.allowanceBucket());
        assertThat(creditGuard.fallbackCredits).isEqualTo(policy.fallbackCredits());
        assertThat(creditGuard.operationCode).isEqualTo(policy.operationCode());
    }

    private static final class CapturingCreditGuard implements CreditGuardService {
        private final UUID reservationId;
        private UUID profileId;
        private CreditBucket allowanceBucket;
        private int fallbackCredits;
        private String operationCode;

        private CapturingCreditGuard(UUID reservationId) {
            this.reservationId = reservationId;
        }

        @Override
        public Optional<UUID> reserveCredits(UUID profileId, int credits, String operationCode) {
            throw new UnsupportedOperationException("Typed policy must use reserveUsage");
        }

        @Override
        public Optional<UUID> reserveUsage(
                UUID requestedProfileId,
                CreditBucket requestedAllowanceBucket,
                int requestedFallbackCredits,
                String requestedOperationCode
        ) {
            profileId = requestedProfileId;
            allowanceBucket = requestedAllowanceBucket;
            fallbackCredits = requestedFallbackCredits;
            operationCode = requestedOperationCode;
            return Optional.of(reservationId);
        }

        @Override
        public void refundCredits(UUID reservationId, String failureReason) {
            throw new UnsupportedOperationException("Not used by this test");
        }
    }
}
