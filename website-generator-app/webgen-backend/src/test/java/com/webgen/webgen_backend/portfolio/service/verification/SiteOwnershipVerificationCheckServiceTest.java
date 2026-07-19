package com.webgen.webgen_backend.portfolio.service.verification;

import com.webgen.webgen_backend.portfolio.dto.verification.SiteOwnershipVerificationDTO;
import com.webgen.webgen_backend.portfolio.entity.SiteOwnershipVerification;
import com.webgen.webgen_backend.portfolio.model.verification.SiteVerificationMethod;
import com.webgen.webgen_backend.portfolio.model.verification.SiteVerificationStatus;
import com.webgen.webgen_backend.portfolio.repository.SiteOwnershipVerificationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Proxy;
import java.net.http.HttpClient;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SiteOwnershipVerificationCheckServiceTest {

    private static final String HTML = "<html><head></head></html>";

    @Test
    void marksChallengeVerifiedWhenDeployedTagMatches() {
        Fixture fixture = new Fixture();
        fixture.pageClient.html = HTML;
        fixture.metaTagMatcher.matches = true;

        SiteOwnershipVerificationDTO result = fixture.service.verify(
                fixture.verification.getUserId(),
                fixture.verification.getId()
        );

        assertThat(result.getStatus()).isEqualTo(SiteVerificationStatus.VERIFIED);
        assertThat(result.getVerifiedAt()).isNotNull();
        assertThat(fixture.repository.saveCount).isEqualTo(1);
    }

    @Test
    void leavesPendingChallengeUnchangedWhenTagIsMissing() {
        Fixture fixture = new Fixture();
        fixture.pageClient.html = HTML;

        assertThatThrownBy(() -> fixture.service.verify(
                fixture.verification.getUserId(),
                fixture.verification.getId()
        )).isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                assertThat(exception.getStatusCode())
                        .isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY)
        );
        assertThat(fixture.verification.getStatus())
                .isEqualTo(SiteVerificationStatus.PENDING);
        assertThat(fixture.repository.saveCount).isZero();
    }

    @Test
    void expiresChallengeBeforeFetchingWebsite() {
        Fixture fixture = new Fixture();
        fixture.verification.setChallengeExpiresAt(
                OffsetDateTime.now().minusMinutes(1)
        );

        assertThatThrownBy(() -> fixture.service.verify(
                fixture.verification.getUserId(),
                fixture.verification.getId()
        )).isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.GONE)
        );
        assertThat(fixture.verification.getStatus())
                .isEqualTo(SiteVerificationStatus.EXPIRED);
        assertThat(fixture.repository.saveCount).isEqualTo(1);
        assertThat(fixture.pageClient.fetchCount).isZero();
    }

    @Test
    void mapsWebsiteFetchFailureToBadGateway() {
        Fixture fixture = new Fixture();
        fixture.pageClient.failure = new SiteVerificationPageFetchException(
                "Unable to reach the website"
        );

        assertThatThrownBy(() -> fixture.service.verify(
                fixture.verification.getUserId(),
                fixture.verification.getId()
        )).isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
            assertThat(exception.getStatusCode())
                    .isEqualTo(HttpStatus.BAD_GATEWAY);
            assertThat(exception.getReason())
                    .isEqualTo("Unable to reach the website");
        });
    }

    private static final class Fixture {
        private final SiteOwnershipVerification verification =
                pendingVerification();
        private final RepositoryFixture repository =
                new RepositoryFixture(verification);
        private final StubPageClient pageClient = new StubPageClient();
        private final StubMetaTagMatcher metaTagMatcher =
                new StubMetaTagMatcher();
        private final SiteOwnershipVerificationCheckService service =
                new SiteOwnershipVerificationCheckService(
                        repository.proxy(),
                        pageClient,
                        metaTagMatcher,
                        new SiteOwnershipVerificationDtoMapper()
                );

        private static SiteOwnershipVerification pendingVerification() {
            return SiteOwnershipVerification.builder()
                    .id(UUID.randomUUID())
                    .userId(UUID.randomUUID())
                    .verificationUrl("https://8.8.8.8/portfolio")
                    .canonicalOrigin("https://8.8.8.8")
                    .method(SiteVerificationMethod.HTML_META)
                    .challengeToken("wg_v1_expected_token_12345678901234567890")
                    .status(SiteVerificationStatus.PENDING)
                    .challengeExpiresAt(OffsetDateTime.now().plusHours(1))
                    .build();
        }
    }

    private static final class RepositoryFixture {
        private SiteOwnershipVerification stored;
        private int saveCount;

        private RepositoryFixture(SiteOwnershipVerification stored) {
            this.stored = stored;
        }

        private SiteOwnershipVerificationRepository proxy() {
            return (SiteOwnershipVerificationRepository) Proxy.newProxyInstance(
                    SiteOwnershipVerificationRepository.class.getClassLoader(),
                    new Class[]{SiteOwnershipVerificationRepository.class},
                    (proxy, method, args) -> switch (method.getName()) {
                        case "findByIdAndUserId" -> Optional.ofNullable(stored);
                        case "save" -> save((SiteOwnershipVerification) args[0]);
                        case "toString" -> "SiteOwnershipVerificationRepositoryFixture";
                        case "hashCode" -> System.identityHashCode(proxy);
                        case "equals" -> proxy == args[0];
                        default -> throw new UnsupportedOperationException(
                                method.getName()
                        );
                    }
            );
        }

        private SiteOwnershipVerification save(
                SiteOwnershipVerification verification
        ) {
            saveCount++;
            stored = verification;
            return verification;
        }
    }

    private static final class StubPageClient extends SiteVerificationPageClient {
        private String html;
        private SiteVerificationPageFetchException failure;
        private int fetchCount;

        private StubPageClient() {
            super(HttpClient.newHttpClient());
        }

        @Override
        public String fetchHtml(String verificationUrl) {
            fetchCount++;
            if (failure != null) throw failure;
            return html;
        }
    }

    private static final class StubMetaTagMatcher
            extends SiteVerificationMetaTagMatcher {
        private boolean matches;

        @Override
        public boolean containsToken(String html, String expectedToken) {
            return matches;
        }
    }
}
