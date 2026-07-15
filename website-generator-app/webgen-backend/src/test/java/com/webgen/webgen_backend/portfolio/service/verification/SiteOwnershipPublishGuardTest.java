package com.webgen.webgen_backend.portfolio.service.verification;

import com.webgen.webgen_backend.portfolio.entity.SiteOwnershipVerification;
import com.webgen.webgen_backend.portfolio.model.verification.SiteVerificationStatus;
import com.webgen.webgen_backend.portfolio.repository.SiteOwnershipVerificationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SiteOwnershipPublishGuardTest {

    private static final String VERIFIED_URL = "https://8.8.8.8/portfolio";

    private final RepositoryFixture repository = new RepositoryFixture();
    private final SiteOwnershipPublishGuard guard =
            new SiteOwnershipPublishGuard(
                    repository.proxy(),
                    new SiteVerificationUrlCanonicalizer()
            );

    @Test
    void authorizesVerifiedChallengeBoundToCanonicalUrl() {
        UUID userId = UUID.randomUUID();
        SiteOwnershipVerification verification = verified(userId);
        repository.stored = verification;

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
        repository.stored = verification;

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
        repository.stored = verification;

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

    private static final class RepositoryFixture {
        private SiteOwnershipVerification stored;

        private SiteOwnershipVerificationRepository proxy() {
            return (SiteOwnershipVerificationRepository) Proxy.newProxyInstance(
                    SiteOwnershipVerificationRepository.class.getClassLoader(),
                    new Class[]{SiteOwnershipVerificationRepository.class},
                    (proxy, method, args) -> switch (method.getName()) {
                        case "findByIdAndUserId" -> find(
                                (UUID) args[0],
                                (UUID) args[1]
                        );
                        case "toString" -> "SiteOwnershipPublishRepositoryFixture";
                        case "hashCode" -> System.identityHashCode(proxy);
                        case "equals" -> proxy == args[0];
                        default -> throw new UnsupportedOperationException(
                                method.getName()
                        );
                    }
            );
        }

        private Optional<SiteOwnershipVerification> find(
                UUID verificationId,
                UUID userId
        ) {
            if (stored == null
                    || !stored.getId().equals(verificationId)
                    || !stored.getUserId().equals(userId)) {
                return Optional.empty();
            }
            return Optional.of(stored);
        }
    }
}
