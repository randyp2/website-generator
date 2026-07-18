package com.webgen.webgen_backend.verification.controller;

import com.webgen.webgen_backend.billing.model.CreditUsagePolicy;
import com.webgen.webgen_backend.billing.service.CreditGuardService;
import com.webgen.webgen_backend.verification.billing.VerificationCreditCostPolicy;
import com.webgen.webgen_backend.verification.dto.evidence.CreateClaimEvidenceUploadPresignRequestDTO;
import com.webgen.webgen_backend.verification.dto.evidence.CreateClaimEvidenceUploadPresignResponseDTO;
import com.webgen.webgen_backend.verification.service.ClaimEvidenceUploadService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Proxy;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ProfileClaimEvidenceUploadControllerTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void presignChecksVerificationEligibilityBeforeCreatingUpload() {
        UUID profileId = authenticate();
        UUID claimId = UUID.randomUUID();
        UploadState uploadState = new UploadState();
        RecordingCreditGuard creditGuard = new RecordingCreditGuard(false);
        ProfileClaimEvidenceUploadController controller = new ProfileClaimEvidenceUploadController(
                claimEvidenceUploadService(uploadState),
                creditGuard
        );

        controller.createUploadPresign(claimId, new CreateClaimEvidenceUploadPresignRequestDTO());

        assertThat(creditGuard.profileId).isEqualTo(profileId);
        assertThat(creditGuard.policy)
                .isEqualTo(VerificationCreditCostPolicy.ASSET_VERIFICATION_USAGE);
        assertThat(uploadState.createPresignCalled).isTrue();
    }

    @Test
    void ineligibleUserIsRejectedBeforeCreatingUpload() {
        authenticate();
        UploadState uploadState = new UploadState();
        RecordingCreditGuard creditGuard = new RecordingCreditGuard(true);
        ProfileClaimEvidenceUploadController controller = new ProfileClaimEvidenceUploadController(
                claimEvidenceUploadService(uploadState),
                creditGuard
        );

        assertThatThrownBy(() -> controller.createUploadPresign(
                UUID.randomUUID(),
                new CreateClaimEvidenceUploadPresignRequestDTO()
        )).isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.PAYMENT_REQUIRED)
        );
        assertThat(uploadState.createPresignCalled).isFalse();
    }

    private UUID authenticate() {
        UUID profileId = UUID.randomUUID();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(profileId.toString(), null)
        );
        return profileId;
    }

    private ClaimEvidenceUploadService claimEvidenceUploadService(UploadState state) {
        return (ClaimEvidenceUploadService) Proxy.newProxyInstance(
                ClaimEvidenceUploadService.class.getClassLoader(),
                new Class[]{ClaimEvidenceUploadService.class},
                (proxy, method, args) -> {
                    if (method.getName().equals("createUploadPresign")) {
                        state.createPresignCalled = true;
                        return CreateClaimEvidenceUploadPresignResponseDTO.builder().build();
                    }
                    throw new UnsupportedOperationException(
                            "Unexpected evidence upload service call: " + method.getName()
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
                        "Insufficient credits for asset verification"
                );
            }
        }

        @Override
        public Optional<UUID> reserveCredits(UUID profileId, int credits, String operationCode) {
            throw new UnsupportedOperationException("Presign must not reserve usage");
        }

        @Override
        public void refundCredits(UUID reservationId, String failureReason) {
            throw new UnsupportedOperationException("Presign must not refund usage");
        }
    }

    private static final class UploadState {
        private boolean createPresignCalled;
    }
}
