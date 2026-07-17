package com.webgen.webgen_backend.portfolio.service.job;

import com.rabbitmq.client.Channel;
import com.webgen.webgen_backend.account.service.AccountDeletionStateService;
import com.webgen.webgen_backend.shared.config.RabbitMQConfig;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.service.screenshot.ScreenshotService;
import com.webgen.webgen_backend.portfolio.service.screenshot.ScreenshotStorageService;
import com.webgen.webgen_backend.portfolio.service.screenshot.GeneratedPreviewScreenshotProcessor;
import com.webgen.webgen_backend.portfolio.service.screenshot.ExternalPreviewScreenshotProcessor;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import com.webgen.webgen_backend.portfolio.repository.SiteOwnershipVerificationRepository;
import com.webgen.webgen_backend.shared.util.ExternalUrlSafetyValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScreenshotWorker {

    private final ScreenshotService screenshotService;
    private final ScreenshotStorageService screenshotStorageService;
    private final PortfolioRepository portfolioRepository;
    private final SiteOwnershipVerificationRepository siteOwnershipVerificationRepository;
    private final AccountDeletionStateService accountDeletionStateService;
    private final GeneratedPreviewScreenshotProcessor generatedPreviewProcessor;
    private final ExternalPreviewScreenshotProcessor externalPreviewProcessor;

    @RabbitListener(queues = RabbitMQConfig.SCREENSHOT_QUEUE, ackMode = "MANUAL")
    public void handleScreenshot(
            ScreenshotMessage msg,
            Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag
    ) throws IOException {
        try {
            log.info(
                    "Screenshot worker received jobId={} portfolioId={} siteVerificationId={} slug={}",
                    msg.getJobId(),
                    msg.getPortfolioId(),
                    msg.getSiteVerificationId(),
                    msg.getSlug()
            );

            if (isOwnedByDeletingAccount(msg)) {
                log.info("Skipping screenshot for deleting account jobId={}", msg.getJobId());
                channel.basicAck(deliveryTag, false);
                return;
            }

            if (StringUtils.hasText(msg.getSiteVerificationId())) {
                externalPreviewProcessor.process(msg);
                channel.basicAck(deliveryTag, false);
                return;
            }

            if (StringUtils.hasText(msg.getGeneratedVersionId())) {
                generatedPreviewProcessor.process(msg);
                channel.basicAck(deliveryTag, false);
                return;
            }

            // --- Skip stale jobs before the expensive capture: when versions
            // are switched rapidly, only the job for the current pin runs
            if (isStaleForPin(msg)) {
                log.info("Skipping stale screenshot job jobId={}", msg.getJobId());
                channel.basicAck(deliveryTag, false);
                return;
            }

            // --- Capture screenshot via Playwright
            String targetUrl = msg.getTargetUrl();
            if (targetUrl != null && !targetUrl.isBlank()) {
                targetUrl = ExternalUrlSafetyValidator.normalizeAndValidateExternalUrl(targetUrl);
                log.info("Capturing external screenshot targetUrl={}", targetUrl);
            } else {
                log.info("Capturing portfolio screenshot slug={}", msg.getSlug());
            }

            byte[] pngBytes = (targetUrl != null && !targetUrl.isBlank())
                    ? screenshotService.captureScreenshotByUrl(targetUrl)
                    : screenshotService.captureScreenshot(msg.getSlug());
            log.info("Screenshot captured jobId={} bytes={}", msg.getJobId(), pngBytes.length);

            // --- Upload to storage
            String screenshotUrl = screenshotStorageService.uploadScreenshot(msg.getPortfolioId(), pngBytes);

            // --- Persist url to DB, unless the pin moved while we were
            // capturing: a concurrent job for the new pin owns the screenshot,
            // and saving here could overwrite it with a stale image
            if (isStaleForPin(msg)) {
                log.info("Discarding stale screenshot capture jobId={}", msg.getJobId());
                channel.basicAck(deliveryTag, false);
                return;
            }

            UUID portfolioId = UUID.fromString(msg.getPortfolioId());
            Portfolio portfolio = portfolioRepository.findById(portfolioId)
                    .orElseThrow(() -> new RuntimeException(
                            "Portfolio not found: " + portfolioId
                    ));
            portfolio.setScreenshotUrl(screenshotUrl);
            portfolioRepository.save(portfolio);
            log.info(
                    "Saved portfolio screenshot jobId={} portfolioId={} screenshotUrl={}",
                    msg.getJobId(),
                    portfolioId,
                    screenshotUrl
            );

            // --- Ack message
            channel.basicAck(deliveryTag, false);

        } catch (Exception e) {
            log.error(
                    "Screenshot job failed jobId={} portfolioId={} siteVerificationId={} slug={}",
                    msg.getJobId(),
                    msg.getPortfolioId(),
                    msg.getSiteVerificationId(),
                    msg.getSlug(),
                    e
            );

            // Reject and nack message
            channel.basicNack(deliveryTag, false, false);
        }
    }

    /*
     * A job is stale when it was queued for a published version that is no
     * longer the portfolio's pin. Unstamped jobs (external portfolios, legacy
     * messages in flight) always run.
     */
    private boolean isStaleForPin(ScreenshotMessage msg) {
        if (msg.getPublishedVersionId() == null || msg.getPublishedVersionId().isBlank())
            return false;

        return portfolioRepository.findById(UUID.fromString(msg.getPortfolioId()))
                .map(Portfolio::getPublishedVersionId)
                .map(currentPin -> !msg.getPublishedVersionId().equals(currentPin.toString()))
                .orElse(true);
    }

    private boolean isOwnedByDeletingAccount(ScreenshotMessage message) {
        UUID profileId = resolveOwningProfileId(message);
        return accountDeletionStateService.hasDeletionStarted(profileId);
    }

    private UUID resolveOwningProfileId(ScreenshotMessage message) {
        try {
            if (StringUtils.hasText(message.getSiteVerificationId())) {
                UUID verificationId = UUID.fromString(message.getSiteVerificationId());
                return siteOwnershipVerificationRepository.findById(verificationId)
                        .map(verification -> verification.getUserId())
                        .orElse(null);
            }
            if (StringUtils.hasText(message.getPortfolioId())) {
                UUID portfolioId = UUID.fromString(message.getPortfolioId());
                return portfolioRepository.findById(portfolioId)
                        .map(Portfolio::getUserId)
                        .orElse(null);
            }
            return null;
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }
}
