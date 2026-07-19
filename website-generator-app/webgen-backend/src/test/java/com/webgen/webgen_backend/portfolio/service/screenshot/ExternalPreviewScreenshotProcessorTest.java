package com.webgen.webgen_backend.portfolio.service.screenshot;

import com.webgen.webgen_backend.portfolio.entity.SiteOwnershipVerification;
import com.webgen.webgen_backend.portfolio.model.screenshot.SitePreviewStatus;
import com.webgen.webgen_backend.portfolio.model.verification.SiteVerificationStatus;
import com.webgen.webgen_backend.portfolio.repository.SiteOwnershipVerificationRepository;
import com.webgen.webgen_backend.portfolio.service.job.ScreenshotMessage;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ExternalPreviewScreenshotProcessorTest {

    @Test
    void capturesStoredVerifiedUrlAndPersistsReadyState() {
        RepositoryFixture repository = new RepositoryFixture();
        SiteOwnershipVerification verification = repository.storeQueued();
        RecordingScreenshotService screenshotService = new RecordingScreenshotService(false);
        ExternalPreviewScreenshotProcessor processor = new ExternalPreviewScreenshotProcessor(
                repository.proxy(),
                screenshotService,
                new StubStorageService()
        );

        processor.process(ScreenshotMessage.forSiteVerification(verification.getId().toString()));

        assertThat(screenshotService.capturedUrl).isEqualTo(verification.getVerificationUrl());
        assertThat(repository.stored.getPreviewStatus()).isEqualTo(SitePreviewStatus.READY);
        assertThat(repository.stored.getPreviewUrl()).isEqualTo("https://cdn.example/external.png");
        assertThat(repository.stored.getPreviewCapturedAt()).isNotNull();
    }

    @Test
    void recordsFailedStateWhenCaptureThrows() {
        RepositoryFixture repository = new RepositoryFixture();
        SiteOwnershipVerification verification = repository.storeQueued();
        ExternalPreviewScreenshotProcessor processor = new ExternalPreviewScreenshotProcessor(
                repository.proxy(),
                new RecordingScreenshotService(true),
                new StubStorageService()
        );
        ScreenshotMessage message = ScreenshotMessage.forSiteVerification(verification.getId().toString());

        assertThatThrownBy(() -> processor.process(message))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("capture failed");
        assertThat(repository.stored.getPreviewStatus()).isEqualTo(SitePreviewStatus.FAILED);
        assertThat(repository.stored.getPreviewUrl()).isNull();
    }

    private static final class RecordingScreenshotService extends ScreenshotService {
        private final boolean fail;
        private String capturedUrl;

        private RecordingScreenshotService(boolean fail) {
            this.fail = fail;
        }

        @Override
        public byte[] captureScreenshotByUrl(String url) {
            capturedUrl = url;
            if (fail) throw new IllegalStateException("capture failed");
            return new byte[]{1, 2, 3};
        }
    }

    private static final class StubStorageService extends ScreenshotStorageService {
        @Override
        public String uploadSiteVerificationPreview(String verificationId, byte[] pngBytes) {
            return "https://cdn.example/external.png";
        }
    }

    private static final class RepositoryFixture {
        private SiteOwnershipVerification stored;

        private SiteOwnershipVerification storeQueued() {
            stored = SiteOwnershipVerification.builder()
                    .id(UUID.randomUUID())
                    .userId(UUID.randomUUID())
                    .verificationUrl("https://8.8.8.8/portfolio")
                    .canonicalOrigin("https://8.8.8.8")
                    .challengeToken("wg_v1_verified_token_123456789012345678901")
                    .status(SiteVerificationStatus.VERIFIED)
                    .challengeExpiresAt(OffsetDateTime.now().plusHours(1))
                    .verifiedAt(OffsetDateTime.now())
                    .previewStatus(SitePreviewStatus.QUEUED)
                    .build();
            return stored;
        }

        private SiteOwnershipVerificationRepository proxy() {
            return (SiteOwnershipVerificationRepository) Proxy.newProxyInstance(
                    SiteOwnershipVerificationRepository.class.getClassLoader(),
                    new Class[]{SiteOwnershipVerificationRepository.class},
                    (proxy, method, args) -> switch (method.getName()) {
                        case "findById" -> Optional.ofNullable(stored)
                                .filter(value -> value.getId().equals(args[0]));
                        case "save" -> save((SiteOwnershipVerification) args[0]);
                        case "toString" -> "SiteOwnershipVerificationRepositoryFixture";
                        case "hashCode" -> System.identityHashCode(proxy);
                        case "equals" -> proxy == args[0];
                        default -> throw new UnsupportedOperationException(method.getName());
                    }
            );
        }

        private SiteOwnershipVerification save(SiteOwnershipVerification verification) {
            stored = verification;
            return verification;
        }
    }
}
