package com.webgen.webgen_backend.portfolio.service.screenshot;

import com.webgen.webgen_backend.portfolio.dto.crud.PublishRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.screenshot.GeneratedPreviewResponseDTO;
import com.webgen.webgen_backend.portfolio.entity.GeneratedVersion;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.repository.GeneratedVersionRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import com.webgen.webgen_backend.portfolio.service.job.ScreenshotMessage;
import com.webgen.webgen_backend.shared.config.RabbitMQConfig;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Proxy;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GeneratedPortfolioPreviewServiceTest {

    private final RepositoryFixture repositories = new RepositoryFixture();
    private final RecordingRabbitTemplate rabbitTemplate = new RecordingRabbitTemplate();
    private final GeneratedPortfolioPreviewService service = new GeneratedPortfolioPreviewService(
            repositories.portfolios(),
            repositories.versions(),
            rabbitTemplate
    );

    @Test
    void requestPreviewQueuesTheOwnedActiveGeneratedVersion() {
        UUID userId = UUID.randomUUID();
        repositories.storeGeneratedPortfolio(userId, null);

        GeneratedPreviewResponseDTO response = service.requestPreview(userId, repositories.portfolio.getId());

        assertThat(response.status()).isEqualTo(GeneratedPreviewResponseDTO.Status.QUEUED);
        assertThat(response.versionId()).isEqualTo(repositories.version.getId());
        assertThat(response.previewUrl()).isNull();
        assertThat(rabbitTemplate.exchange).isEqualTo(RabbitMQConfig.EXCHANGE);
        assertThat(rabbitTemplate.routingKey).isEqualTo(RabbitMQConfig.SCREENSHOT_ROUTING_KEY);
        assertThat(rabbitTemplate.message)
                .isInstanceOfSatisfying(ScreenshotMessage.class, message -> {
                    assertThat(message.getPortfolioId()).isEqualTo(repositories.portfolio.getId().toString());
                    assertThat(message.getGeneratedVersionId()).isEqualTo(repositories.version.getId().toString());
                    assertThat(message.getPublishedVersionId()).isNull();
                    assertThat(message.getTargetUrl()).isNull();
                });
    }

    @Test
    void requestPreviewReusesACompletedVersionPreview() {
        UUID userId = UUID.randomUUID();
        repositories.storeGeneratedPortfolio(userId, "https://cdn.example/version.png");

        GeneratedPreviewResponseDTO response = service.requestPreview(userId, repositories.portfolio.getId());

        assertThat(response.status()).isEqualTo(GeneratedPreviewResponseDTO.Status.READY);
        assertThat(response.previewUrl()).isEqualTo("https://cdn.example/version.png");
        assertThat(rabbitTemplate.calls).isZero();
    }

    @Test
    void requestPreviewRejectsAnotherUsersPortfolio() {
        repositories.storeGeneratedPortfolio(UUID.randomUUID(), null);

        assertThatThrownBy(() -> service.requestPreview(
                UUID.randomUUID(),
                repositories.portfolio.getId()
        )).isInstanceOfSatisfying(
                ResponseStatusException.class,
                exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN)
        );
        assertThat(rabbitTemplate.calls).isZero();
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

    private static final class RepositoryFixture {
        private Portfolio portfolio;
        private GeneratedVersion version;

        private void storeGeneratedPortfolio(UUID userId, String previewUrl) {
            UUID portfolioId = UUID.randomUUID();
            UUID versionId = UUID.randomUUID();

            portfolio = new Portfolio();
            portfolio.setId(portfolioId);
            portfolio.setUserId(userId);
            portfolio.setSourceType(PublishRequestDTO.SourceType.GENERATED.name());
            portfolio.setActiveVersionId(versionId);

            version = new GeneratedVersion();
            version.setId(versionId);
            version.setPortfolio(portfolio);
            version.setPreviewUrl(previewUrl);
        }

        private PortfolioRepository portfolios() {
            return proxy(PortfolioRepository.class, (method, args) -> switch (method) {
                case "findById" -> Optional.ofNullable(portfolio)
                        .filter(stored -> stored.getId().equals(args[0]));
                default -> throw new UnsupportedOperationException(method);
            });
        }

        private GeneratedVersionRepository versions() {
            return proxy(GeneratedVersionRepository.class, (method, args) -> switch (method) {
                case "findByIdAndPortfolio_Id" -> Optional.ofNullable(version)
                        .filter(stored -> stored.getId().equals(args[0]))
                        .filter(stored -> stored.getPortfolio().getId().equals(args[1]));
                default -> throw new UnsupportedOperationException(method);
            });
        }

        private <T> T proxy(Class<T> type, RepositoryInvocation invocation) {
            return type.cast(Proxy.newProxyInstance(
                    type.getClassLoader(),
                    new Class[]{type},
                    (proxy, method, args) -> switch (method.getName()) {
                        case "toString" -> type.getSimpleName() + "Fixture";
                        case "hashCode" -> System.identityHashCode(proxy);
                        case "equals" -> proxy == args[0];
                        default -> invocation.invoke(method.getName(), args);
                    }
            ));
        }
    }

    @FunctionalInterface
    private interface RepositoryInvocation {
        Object invoke(String method, Object[] args);
    }
}
