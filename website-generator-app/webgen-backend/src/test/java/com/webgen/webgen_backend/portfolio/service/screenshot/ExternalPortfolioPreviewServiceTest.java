package com.webgen.webgen_backend.portfolio.service.screenshot;

import com.webgen.webgen_backend.account.service.AccountDeletionStateService;
import com.webgen.webgen_backend.portfolio.dto.screenshot.ExternalPreviewResponseDTO;
import com.webgen.webgen_backend.portfolio.entity.SiteOwnershipVerification;
import com.webgen.webgen_backend.portfolio.model.screenshot.SitePreviewStatus;
import com.webgen.webgen_backend.portfolio.model.verification.SiteVerificationStatus;
import com.webgen.webgen_backend.portfolio.repository.SiteOwnershipVerificationRepository;
import com.webgen.webgen_backend.portfolio.service.job.ScreenshotMessage;
import com.webgen.webgen_backend.shared.config.RabbitMQConfig;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ExternalPortfolioPreviewServiceTest {

    private final RepositoryFixture repository = new RepositoryFixture();
    private final RecordingRabbitTemplate rabbitTemplate = new RecordingRabbitTemplate();
    private final ExternalPortfolioPreviewService service = new ExternalPortfolioPreviewService(
            repository.proxy(),
            rabbitTemplate,
            activeAccountStateService()
    );

    private static AccountDeletionStateService activeAccountStateService() {
        return new AccountDeletionStateService(null, null) {
            @Override
            public void assertAccountActive(UUID profileId) {
            }
        };
    }

    @Test
    void requestPreviewQueuesVerifiedWebsiteOnce() {
        SiteOwnershipVerification verification = repository.storeVerified(SitePreviewStatus.NOT_REQUESTED);

        ExternalPreviewResponseDTO response = service.requestPreview(
                verification.getUserId(),
                verification.getId()
        );

        assertThat(response.status()).isEqualTo(SitePreviewStatus.QUEUED);
        assertThat(repository.stored.getPreviewStatus()).isEqualTo(SitePreviewStatus.QUEUED);
        assertThat(rabbitTemplate.exchange).isEqualTo(RabbitMQConfig.EXCHANGE);
        assertThat(rabbitTemplate.routingKey).isEqualTo(RabbitMQConfig.SCREENSHOT_ROUTING_KEY);
        assertThat(rabbitTemplate.message)
                .isInstanceOfSatisfying(ScreenshotMessage.class, message -> {
                    assertThat(message.getSiteVerificationId()).isEqualTo(verification.getId().toString());
                    assertThat(message.getTargetUrl()).isNull();
                    assertThat(message.getPortfolioId()).isNull();
                });
    }

    @Test
    void requestPreviewDoesNotDuplicateQueuedCapture() {
        SiteOwnershipVerification verification = repository.storeVerified(SitePreviewStatus.QUEUED);

        ExternalPreviewResponseDTO response = service.requestPreview(
                verification.getUserId(),
                verification.getId()
        );

        assertThat(response.status()).isEqualTo(SitePreviewStatus.QUEUED);
        assertThat(rabbitTemplate.calls).isZero();
    }

    @Test
    void requestPreviewRequeuesFailedCapture() {
        SiteOwnershipVerification verification = repository.storeVerified(SitePreviewStatus.FAILED);

        ExternalPreviewResponseDTO response = service.requestPreview(
                verification.getUserId(),
                verification.getId()
        );

        assertThat(response.status()).isEqualTo(SitePreviewStatus.QUEUED);
        assertThat(rabbitTemplate.calls).isOne();
    }

    @Test
    void requestPreviewRejectsIncompleteOwnershipVerification() {
        SiteOwnershipVerification verification = repository.storeVerified(SitePreviewStatus.NOT_REQUESTED);
        verification.setStatus(SiteVerificationStatus.PENDING);
        verification.setVerifiedAt(null);

        assertThatThrownBy(() -> service.requestPreview(
                verification.getUserId(),
                verification.getId()
        )).isInstanceOfSatisfying(
                ResponseStatusException.class,
                exception -> assertThat(exception.getStatusCode())
                        .isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY)
        );
        assertThat(rabbitTemplate.calls).isZero();
    }

    @Test
    void requestPreviewRestoresRequestableStateWhenQueuePublishFails() {
        SiteOwnershipVerification verification = repository.storeVerified(SitePreviewStatus.NOT_REQUESTED);
        ExternalPortfolioPreviewService failingService = new ExternalPortfolioPreviewService(
                repository.proxy(),
                new ThrowingRabbitTemplate(),
                activeAccountStateService()
        );

        assertThatThrownBy(() -> failingService.requestPreview(
                verification.getUserId(),
                verification.getId()
        )).isInstanceOf(IllegalStateException.class)
                .hasMessage("queue unavailable");
        assertThat(repository.stored.getPreviewStatus()).isEqualTo(SitePreviewStatus.NOT_REQUESTED);
    }

    private static final class RecordingRabbitTemplate extends RabbitTemplate {
        private int calls;
        private String exchange;
        private String routingKey;
        private Object message;

        @Override
        public void convertAndSend(String exchange, String routingKey, Object message) {
            this.calls++;
            this.exchange = exchange;
            this.routingKey = routingKey;
            this.message = message;
        }
    }

    private static final class ThrowingRabbitTemplate extends RabbitTemplate {
        @Override
        public void convertAndSend(String exchange, String routingKey, Object message) {
            throw new IllegalStateException("queue unavailable");
        }
    }

    private static final class RepositoryFixture {
        private SiteOwnershipVerification stored;

        private SiteOwnershipVerification storeVerified(SitePreviewStatus previewStatus) {
            stored = SiteOwnershipVerification.builder()
                    .id(UUID.randomUUID())
                    .userId(UUID.randomUUID())
                    .verificationUrl("https://8.8.8.8/portfolio")
                    .canonicalOrigin("https://8.8.8.8")
                    .challengeToken("wg_v1_verified_token_123456789012345678901")
                    .status(SiteVerificationStatus.VERIFIED)
                    .challengeExpiresAt(OffsetDateTime.now().plusHours(1))
                    .verifiedAt(OffsetDateTime.now())
                    .previewStatus(previewStatus)
                    .build();
            return stored;
        }

        private SiteOwnershipVerificationRepository proxy() {
            return (SiteOwnershipVerificationRepository) Proxy.newProxyInstance(
                    SiteOwnershipVerificationRepository.class.getClassLoader(),
                    new Class[]{SiteOwnershipVerificationRepository.class},
                    (proxy, method, args) -> switch (method.getName()) {
                        case "findByIdAndUserId" -> find((UUID) args[0], (UUID) args[1]);
                        case "save" -> save((SiteOwnershipVerification) args[0]);
                        case "toString" -> "SiteOwnershipVerificationRepositoryFixture";
                        case "hashCode" -> System.identityHashCode(proxy);
                        case "equals" -> proxy == args[0];
                        default -> throw new UnsupportedOperationException(method.getName());
                    }
            );
        }

        private Optional<SiteOwnershipVerification> find(UUID verificationId, UUID userId) {
            return Optional.ofNullable(stored)
                    .filter(value -> value.getId().equals(verificationId))
                    .filter(value -> value.getUserId().equals(userId));
        }

        private SiteOwnershipVerification save(SiteOwnershipVerification verification) {
            stored = verification;
            return verification;
        }
    }
}
