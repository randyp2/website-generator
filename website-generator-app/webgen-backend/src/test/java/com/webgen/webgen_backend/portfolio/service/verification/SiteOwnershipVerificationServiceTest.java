package com.webgen.webgen_backend.portfolio.service.verification;

import com.webgen.webgen_backend.account.service.AccountDeletionStateService;
import com.webgen.webgen_backend.portfolio.dto.verification.CreateSiteOwnershipVerificationRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.verification.SiteOwnershipVerificationDTO;
import com.webgen.webgen_backend.portfolio.entity.SiteOwnershipVerification;
import com.webgen.webgen_backend.portfolio.model.verification.SiteVerificationMethod;
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

class SiteOwnershipVerificationServiceTest {

    private static final String URL = "https://8.8.8.8/portfolio";
    private static final String ORIGIN = "https://8.8.8.8";

    @Test
    void createsPendingChallengeForCanonicalUrl() {
        RepositoryFixture fixture = new RepositoryFixture();
        OffsetDateTime before = OffsetDateTime.now().plusHours(23);

        SiteOwnershipVerificationDTO result = fixture.service().createChallenge(
                UUID.randomUUID(),
                request("https://8.8.8.8:443/work/../portfolio#about")
        );

        assertThat(result.getVerificationId()).isNotNull();
        assertThat(result.getVerificationUrl()).isEqualTo(URL);
        assertThat(result.getCanonicalOrigin()).isEqualTo(ORIGIN);
        assertThat(result.getMethod()).isEqualTo(SiteVerificationMethod.HTML_META);
        assertThat(result.getStatus()).isEqualTo(SiteVerificationStatus.PENDING);
        assertThat(result.getVerificationTag()).matches(
                "<meta name=\"portrn-site-verification\" content=\"wg_v1_[A-Za-z0-9_-]{43}\">"
        );
        assertThat(result.getChallengeExpiresAt()).isAfter(before);
        assertThat(fixture.saveCount).isEqualTo(1);
    }

    @Test
    void reusesUnexpiredPendingChallenge() {
        UUID userId = UUID.randomUUID();
        RepositoryFixture fixture = new RepositoryFixture();
        fixture.stored = verification(
                userId,
                SiteVerificationStatus.PENDING,
                OffsetDateTime.now().plusHours(1),
                "wg_v1_existing_challenge_token_1234567890"
        );

        SiteOwnershipVerificationDTO result = fixture.service()
                .createChallenge(userId, request(URL));

        assertThat(result.getVerificationId()).isEqualTo(fixture.stored.getId());
        assertThat(result.getVerificationTag()).contains("wg_v1_existing_challenge_token_1234567890");
        assertThat(fixture.saveCount).isZero();
    }

    @Test
    void refreshesExpiredChallenge() {
        UUID userId = UUID.randomUUID();
        RepositoryFixture fixture = new RepositoryFixture();
        fixture.stored = verification(
                userId,
                SiteVerificationStatus.EXPIRED,
                OffsetDateTime.now().minusMinutes(1),
                "wg_v1_expired_challenge_token_123456789"
        );

        SiteOwnershipVerificationDTO result = fixture.service()
                .createChallenge(userId, request(URL));

        assertThat(result.getStatus()).isEqualTo(SiteVerificationStatus.PENDING);
        assertThat(result.getVerificationTag()).doesNotContain("expired_challenge");
        assertThat(fixture.saveCount).isEqualTo(1);
    }

    @Test
    void mapsInvalidUrlToBadRequest() {
        RepositoryFixture fixture = new RepositoryFixture();

        assertThatThrownBy(() -> fixture.service().createChallenge(
                UUID.randomUUID(),
                request("http://8.8.8.8/portfolio")
        )).isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST)
        );
    }

    private CreateSiteOwnershipVerificationRequestDTO request(String externalUrl) {
        CreateSiteOwnershipVerificationRequestDTO request =
                new CreateSiteOwnershipVerificationRequestDTO();
        request.setExternalUrl(externalUrl);
        return request;
    }

    private SiteOwnershipVerification verification(
            UUID userId,
            SiteVerificationStatus status,
            OffsetDateTime expiresAt,
            String token
    ) {
        return SiteOwnershipVerification.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .verificationUrl(URL)
                .canonicalOrigin(ORIGIN)
                .method(SiteVerificationMethod.HTML_META)
                .challengeToken(token)
                .status(status)
                .challengeExpiresAt(expiresAt)
                .build();
    }

    private static final class RepositoryFixture {
        private SiteOwnershipVerification stored;
        private int saveCount;

        private SiteOwnershipVerificationService service() {
            return new SiteOwnershipVerificationService(
                    repository(),
                    new SiteVerificationUrlCanonicalizer(),
                    new SiteVerificationTokenGenerator(),
                    new SiteOwnershipVerificationDtoMapper(),
                    new AccountDeletionStateService(null, null) {
                        @Override
                        public void assertAccountActive(UUID profileId) {
                        }
                    }
            );
        }

        private SiteOwnershipVerificationRepository repository() {
            return (SiteOwnershipVerificationRepository) Proxy.newProxyInstance(
                    SiteOwnershipVerificationRepository.class.getClassLoader(),
                    new Class[]{SiteOwnershipVerificationRepository.class},
                    (proxy, method, args) -> switch (method.getName()) {
                        case "findByUserIdAndVerificationUrlAndMethod" -> Optional.ofNullable(stored);
                        case "save" -> save((SiteOwnershipVerification) args[0]);
                        case "toString" -> "SiteOwnershipVerificationRepositoryFixture";
                        case "hashCode" -> System.identityHashCode(proxy);
                        case "equals" -> proxy == args[0];
                        default -> throw new UnsupportedOperationException(method.getName());
                    }
            );
        }

        private SiteOwnershipVerification save(SiteOwnershipVerification verification) {
            saveCount++;
            if (verification.getId() == null) {
                verification.setId(UUID.randomUUID());
            }
            stored = verification;
            return verification;
        }
    }
}
