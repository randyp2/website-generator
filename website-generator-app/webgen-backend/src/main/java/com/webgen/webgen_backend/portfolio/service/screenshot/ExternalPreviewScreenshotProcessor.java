package com.webgen.webgen_backend.portfolio.service.screenshot;

import com.webgen.webgen_backend.portfolio.entity.SiteOwnershipVerification;
import com.webgen.webgen_backend.portfolio.model.screenshot.SitePreviewStatus;
import com.webgen.webgen_backend.portfolio.model.verification.SiteVerificationStatus;
import com.webgen.webgen_backend.portfolio.repository.SiteOwnershipVerificationRepository;
import com.webgen.webgen_backend.portfolio.service.job.ScreenshotMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExternalPreviewScreenshotProcessor {

    private final SiteOwnershipVerificationRepository repository;
    private final ScreenshotService screenshotService;
    private final ScreenshotStorageService storageService;

    /** Captures the stored URL for a queued, verified website preview. */
    public void process(ScreenshotMessage message) {
        UUID verificationId = UUID.fromString(message.getSiteVerificationId());
        SiteOwnershipVerification verification = repository.findById(verificationId)
                .orElseThrow(() -> new IllegalStateException(
                        "Website verification not found: " + verificationId
                ));
        if (verification.getStatus() != SiteVerificationStatus.VERIFIED
                || verification.getPreviewStatus() != SitePreviewStatus.QUEUED) {
            log.info(
                    "Skipping stale external preview screenshot verificationId={} verificationStatus={} previewStatus={}",
                    verificationId,
                    verification.getStatus(),
                    verification.getPreviewStatus()
            );
            return;
        }

        verification.setPreviewStatus(SitePreviewStatus.CAPTURING);
        repository.save(verification);
        try {
            byte[] pngBytes = screenshotService.captureScreenshotByUrl(verification.getVerificationUrl());
            String previewUrl = storageService.uploadSiteVerificationPreview(
                    verificationId.toString(),
                    pngBytes
            );
            verification.setPreviewUrl(previewUrl);
            verification.setPreviewCapturedAt(OffsetDateTime.now());
            verification.setPreviewStatus(SitePreviewStatus.READY);
            repository.save(verification);
            log.info(
                    "Saved external portfolio preview screenshot verificationId={} bytes={}",
                    verificationId,
                    pngBytes.length
            );
        } catch (RuntimeException exception) {
            verification.setPreviewStatus(SitePreviewStatus.FAILED);
            verification.setPreviewUrl(null);
            verification.setPreviewCapturedAt(null);
            repository.save(verification);
            log.warn(
                    "External portfolio preview screenshot failed verificationId={} reason={}",
                    verificationId,
                    exception.getMessage()
            );
            throw exception;
        }
    }
}
