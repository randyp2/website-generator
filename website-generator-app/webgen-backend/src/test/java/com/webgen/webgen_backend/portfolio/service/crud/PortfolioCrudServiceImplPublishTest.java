package com.webgen.webgen_backend.portfolio.service.crud;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.account.service.AccountDeletionStateService;
import com.webgen.webgen_backend.portfolio.dto.crud.PublishRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.crud.PublishResponseDTO;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.entity.SiteOwnershipVerification;
import com.webgen.webgen_backend.portfolio.mapper.AssetMapper;
import com.webgen.webgen_backend.portfolio.mapper.PortfolioMapper;
import com.webgen.webgen_backend.portfolio.model.verification.SiteVerificationStatus;
import com.webgen.webgen_backend.portfolio.model.screenshot.SitePreviewStatus;
import com.webgen.webgen_backend.portfolio.repository.AssetRepository;
import com.webgen.webgen_backend.portfolio.repository.GeneratedVersionRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioSectionRepository;
import com.webgen.webgen_backend.portfolio.repository.SiteOwnershipVerificationRepository;
import com.webgen.webgen_backend.portfolio.service.verification.SiteOwnershipPublishGuard;
import com.webgen.webgen_backend.portfolio.service.verification.SiteVerificationUrlCanonicalizer;
import com.webgen.webgen_backend.portfolio.service.version.VersionSnapshotReader;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import com.webgen.webgen_backend.resume.mapper.ResumeMapper;
import com.webgen.webgen_backend.resume.repository.ResumeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class PortfolioCrudServiceImplPublishTest {

    private static final String EXTERNAL_URL = "https://8.8.8.8/portfolio";

    @Test
    void persistsVerificationThatAuthorizedExternalPublish() {
        UUID userId = UUID.randomUUID();
        SiteOwnershipVerification verification = verified(userId);
        PortfolioRepositoryFixture portfolioRepository =
                new PortfolioRepositoryFixture();
        SiteOwnershipPublishGuard publishGuard = new SiteOwnershipPublishGuard(
                verificationRepository(verification),
                new SiteVerificationUrlCanonicalizer()
        );
        RecordingRabbitTemplate rabbitTemplate = new RecordingRabbitTemplate();
        PortfolioCrudServiceImpl service = service(
                portfolioRepository.proxy(),
                publishGuard,
                rabbitTemplate
        );
        PublishRequestDTO request = new PublishRequestDTO();
        request.setSourceType(PublishRequestDTO.SourceType.EXTERNAL);
        request.setExternalUrl(EXTERNAL_URL);
        request.setSiteVerificationId(verification.getId());
        request.setSlug("verified-portfolio");

        PublishResponseDTO result = service.publishPortfolio(userId, request);

        Portfolio saved = portfolioRepository.saved;
        assertThat(saved).isNotNull();
        assertThat(saved.getSiteVerificationId())
                .isEqualTo(verification.getId());
        assertThat(saved.getExternalUrl()).isEqualTo(EXTERNAL_URL);
        assertThat(saved.getScreenshotUrl()).isEqualTo(verification.getPreviewUrl());
        assertThat(result.getPortfolioId()).isEqualTo(saved.getId().toString());
        assertThat(rabbitTemplate.calls).isZero();
    }

    @Test
    void queuesFallbackCaptureWhenVerifiedPreviewIsNotReady() {
        UUID userId = UUID.randomUUID();
        SiteOwnershipVerification verification = verified(userId);
        verification.setPreviewStatus(SitePreviewStatus.CAPTURING);
        verification.setPreviewUrl(null);
        verification.setPreviewCapturedAt(null);
        PortfolioRepositoryFixture portfolioRepository = new PortfolioRepositoryFixture();
        RecordingRabbitTemplate rabbitTemplate = new RecordingRabbitTemplate();
        PortfolioCrudServiceImpl service = service(
                portfolioRepository.proxy(),
                new SiteOwnershipPublishGuard(
                        verificationRepository(verification),
                        new SiteVerificationUrlCanonicalizer()
                ),
                rabbitTemplate
        );
        PublishRequestDTO request = new PublishRequestDTO();
        request.setSourceType(PublishRequestDTO.SourceType.EXTERNAL);
        request.setExternalUrl(EXTERNAL_URL);
        request.setSiteVerificationId(verification.getId());
        request.setSlug("capture-pending");

        service.publishPortfolio(userId, request);

        assertThat(portfolioRepository.saved.getScreenshotUrl()).isNull();
        assertThat(rabbitTemplate.calls).isOne();
    }

    private PortfolioCrudServiceImpl service(
            PortfolioRepository portfolioRepository,
            SiteOwnershipPublishGuard publishGuard,
            RabbitTemplate rabbitTemplate
    ) {
        ObjectMapper objectMapper = new ObjectMapper();
        return new PortfolioCrudServiceImpl(
                portfolioRepository,
                unused(ResumeRepository.class),
                unused(AssetRepository.class),
                unused(GeneratedVersionRepository.class),
                unused(PortfolioSectionRepository.class),
                unused(ProfileRepository.class),
                unused(PortfolioMapper.class),
                unused(ResumeMapper.class),
                unused(AssetMapper.class),
                rabbitTemplate,
                objectMapper,
                new VersionSnapshotReader(objectMapper),
                publishGuard,
                activeAccountStateService()
        );
    }

    private AccountDeletionStateService activeAccountStateService() {
        return new AccountDeletionStateService(null, null) {
            @Override
            public void assertAccountActive(UUID profileId) {
            }
        };
    }

    private SiteOwnershipVerification verified(UUID userId) {
        return SiteOwnershipVerification.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .verificationUrl(EXTERNAL_URL)
                .canonicalOrigin("https://8.8.8.8")
                .challengeToken("wg_v1_verified_token_123456789012345678901")
                .status(SiteVerificationStatus.VERIFIED)
                .challengeExpiresAt(OffsetDateTime.now().plusHours(1))
                .verifiedAt(OffsetDateTime.now())
                .previewUrl("https://cdn.example/external-preview.png")
                .previewStatus(SitePreviewStatus.READY)
                .previewCapturedAt(OffsetDateTime.now())
                .build();
    }

    private SiteOwnershipVerificationRepository verificationRepository(
            SiteOwnershipVerification verification
    ) {
        return (SiteOwnershipVerificationRepository) Proxy.newProxyInstance(
                SiteOwnershipVerificationRepository.class.getClassLoader(),
                new Class[]{SiteOwnershipVerificationRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "findByIdAndUserId" ->
                            verification.getId().equals(args[0])
                                    && verification.getUserId().equals(args[1])
                                    ? Optional.of(verification)
                                    : Optional.empty();
                    case "toString" -> "SiteOwnershipVerificationFixture";
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> throw new UnsupportedOperationException(
                            method.getName()
                    );
                }
        );
    }

    @SuppressWarnings("unchecked")
    private <T> T unused(Class<T> contract) {
        return (T) Proxy.newProxyInstance(
                contract.getClassLoader(),
                new Class[]{contract},
                (proxy, method, args) -> switch (method.getName()) {
                    case "toString" -> contract.getSimpleName() + "Fixture";
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> throw new UnsupportedOperationException(
                            method.getName()
                    );
                }
        );
    }

    private static final class PortfolioRepositoryFixture {
        private Portfolio saved;

        private PortfolioRepository proxy() {
            return (PortfolioRepository) Proxy.newProxyInstance(
                    PortfolioRepository.class.getClassLoader(),
                    new Class[]{PortfolioRepository.class},
                    (proxy, method, args) -> switch (method.getName()) {
                        case "existsBySlug" -> false;
                        case "save" -> save((Portfolio) args[0]);
                        case "toString" -> "PortfolioRepositoryFixture";
                        case "hashCode" -> System.identityHashCode(proxy);
                        case "equals" -> proxy == args[0];
                        default -> throw new UnsupportedOperationException(
                                method.getName()
                        );
                    }
            );
        }

        private Portfolio save(Portfolio portfolio) {
            saved = portfolio;
            return portfolio;
        }
    }

    private static final class RecordingRabbitTemplate extends RabbitTemplate {
        private int calls;

        @Override
        public void convertAndSend(
                String exchange,
                String routingKey,
                Object message
        ) {
            calls++;
        }
    }
}
