package com.webgen.webgen_backend.portfolio.service.screenshot;

import com.webgen.webgen_backend.portfolio.dto.screenshot.ExternalPreviewResponseDTO;
import com.webgen.webgen_backend.portfolio.entity.SiteOwnershipVerification;
import com.webgen.webgen_backend.portfolio.model.screenshot.SitePreviewStatus;
import com.webgen.webgen_backend.portfolio.model.verification.SiteVerificationStatus;
import com.webgen.webgen_backend.portfolio.repository.SiteOwnershipVerificationRepository;
import com.webgen.webgen_backend.portfolio.service.job.ScreenshotMessage;
import com.webgen.webgen_backend.shared.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExternalPortfolioPreviewService {

    private final SiteOwnershipVerificationRepository repository;
    private final RabbitTemplate rabbitTemplate;

    /** Queues or retries a screenshot for a user-owned verified website. */
    public ExternalPreviewResponseDTO requestPreview(UUID userId, UUID verificationId) {
        SiteOwnershipVerification verification = loadVerified(userId, verificationId);
        SitePreviewStatus status = statusOf(verification);
        if (status == SitePreviewStatus.READY
                || status == SitePreviewStatus.QUEUED
                || status == SitePreviewStatus.CAPTURING) {
            return response(verification);
        }

        verification.setPreviewStatus(SitePreviewStatus.QUEUED);
        verification.setPreviewUrl(null);
        verification.setPreviewCapturedAt(null);
        repository.save(verification);

        ScreenshotMessage message = ScreenshotMessage.forSiteVerification(verificationId.toString());
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE,
                    RabbitMQConfig.SCREENSHOT_ROUTING_KEY,
                    message
            );
        } catch (RuntimeException exception) {
            verification.setPreviewStatus(SitePreviewStatus.NOT_REQUESTED);
            repository.save(verification);
            throw exception;
        }
        log.info(
                "Queued external portfolio preview screenshot verificationId={} userId={} jobId={}",
                verificationId,
                userId,
                message.getJobId()
        );
        return response(verification);
    }

    /** Returns screenshot state for a user-owned verified website. */
    public ExternalPreviewResponseDTO getPreview(UUID userId, UUID verificationId) {
        return response(loadVerified(userId, verificationId));
    }

    private SiteOwnershipVerification loadVerified(UUID userId, UUID verificationId) {
        SiteOwnershipVerification verification = repository
                .findByIdAndUserId(verificationId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Website verification was not found"
                ));
        if (verification.getStatus() != SiteVerificationStatus.VERIFIED
                || verification.getVerifiedAt() == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Website ownership verification is incomplete"
            );
        }
        return verification;
    }

    private ExternalPreviewResponseDTO response(SiteOwnershipVerification verification) {
        return new ExternalPreviewResponseDTO(
                verification.getId(),
                statusOf(verification),
                verification.getPreviewUrl()
        );
    }

    private SitePreviewStatus statusOf(SiteOwnershipVerification verification) {
        return verification.getPreviewStatus() == null
                ? SitePreviewStatus.NOT_REQUESTED
                : verification.getPreviewStatus();
    }
}
