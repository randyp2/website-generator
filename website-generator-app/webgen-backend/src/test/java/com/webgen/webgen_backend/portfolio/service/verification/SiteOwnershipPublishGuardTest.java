package com.webgen.webgen_backend.portfolio.service.verification;

import com.webgen.webgen_backend.portfolio.entity.SiteOwnershipVerification;
import com.webgen.webgen_backend.portfolio.model.verification.SiteVerificationStatus;
import com.webgen.webgen_backend.portfolio.repository.SiteOwnershipVerificationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SiteOwnershipPublishGuardTest {

    private static final String VERIFIED_URL = "https://8.8.8.8/portfolio";

    private final SiteOwnershipVerificationRepository repository =
            mock(SiteOwnershipVerificationRepository.class);
    private final SiteOwnershipPublishGuard guard =
            new SiteOwnershipPublishGuard(
                    repository,
                    new SiteVerificationUrlCanonicalizer()
            );

    @Test
    void authorizesVerifiedChallengeBoundToCanonicalUrl() {
        UUID userId = UUID.randomUUID();
        SiteOwnershipVerification verification = verified(userId);
        when(repository.findByIdAndUserId(verification.getId(), userId))
                .thenReturn(Optional.of(verification));

        UUID result = guard.requireVerified(
                userId,
                verification.getId(),
                "https://8.8.8.8:443/work/../portfolio#about"
        );

        assertThat(result).isEqualTo(verification.getId());
    }

    @Test
    void rejectsMissingVerificationId() {
        assertStatus(
                () -> guard.requireVerified(
                        UUID.randomUUID(),
                        null,
                        VERIFIED_URL
                ),
                HttpStatus.UNPROCESSABLE_ENTITY
        );
    }

    @Test
    void rejectsIncompleteVerification() {
        UUID userId = UUID.randomUUID();
        SiteOwnershipVerification verification = verified(userId);
        verification.setStatus(SiteVerificationStatus.PENDING);
        verification.setVerifiedAt(null);
        when(repository.findByIdAndUserId(verification.getId(), userId))
                .thenReturn(Optional.of(verification));

        assertStatus(
                () -> guard.requireVerified(
                        userId,
                        verification.getId(),
                        VERIFIED_URL
                ),
                HttpStatus.UNPROCESSABLE_ENTITY
        );
    }

    @Test
    void rejectsVerificationOwnedByAnotherUser() {
        assertStatus(
                () -> guard.requireVerified(
                        UUID.randomUUID(),
                        UUID.randomUUID(),
                        VERIFIED_URL
                ),
                HttpStatus.NOT_FOUND
        );
    }

    @Test
    void rejectsVerificationForDifferentUrl() {
        UUID userId = UUID.randomUUID();
        SiteOwnershipVerification verification = verified(userId);
        when(repository.findByIdAndUserId(verification.getId(), userId))
                .thenReturn(Optional.of(verification));

        assertStatus(
                () -> guard.requireVerified(
                        userId,
                        verification.getId(),
                        "https://8.8.8.8/another-portfolio"
                ),
                HttpStatus.UNPROCESSABLE_ENTITY
        );
    }

    private SiteOwnershipVerification verified(UUID userId) {
        return SiteOwnershipVerification.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .verificationUrl(VERIFIED_URL)
                .canonicalOrigin("https://8.8.8.8")
                .challengeToken("wg_v1_verified_token_123456789012345678901")
                .status(SiteVerificationStatus.VERIFIED)
                .challengeExpiresAt(OffsetDateTime.now().minusHours(1))
                .verifiedAt(OffsetDateTime.now().minusHours(2))
                .build();
    }

    private void assertStatus(Runnable operation, HttpStatus expectedStatus) {
        assertThatThrownBy(operation::run)
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(expectedStatus)
                );
    }
}
