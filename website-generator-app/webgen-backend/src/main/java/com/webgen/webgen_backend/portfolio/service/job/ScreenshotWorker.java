package com.webgen.webgen_backend.portfolio.service.job;

import com.rabbitmq.client.Channel;
import com.webgen.webgen_backend.shared.config.RabbitMQConfig;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.service.screenshot.ScreenshotService;
import com.webgen.webgen_backend.portfolio.service.screenshot.ScreenshotStorageService;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import com.webgen.webgen_backend.shared.util.ExternalUrlSafetyValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ScreenshotWorker {

    private final ScreenshotService screenshotService;
    private final ScreenshotStorageService screenshotStorageService;
    private final PortfolioRepository portfolioRepository;

    @RabbitListener(queues = RabbitMQConfig.SCREENSHOT_QUEUE, ackMode = "MANUAL")
    public void handleScreenshot(
            ScreenshotMessage msg,
            Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag
    ) throws IOException {
        try {
            System.out.println(">>> [SCREENSHOT] Worker received message — slug: " + msg.getSlug()
                    + " | portfolioId: " + msg.getPortfolioId()
                    + " | jobId: " + msg.getJobId());

            // --- Capture screenshot via Playwright
            String targetUrl = msg.getTargetUrl();
            if (targetUrl != null && !targetUrl.isBlank()) {
                targetUrl = ExternalUrlSafetyValidator.normalizeAndValidateExternalUrl(targetUrl);
                System.out.println(">>> [SCREENSHOT] Capturing external screenshot for: " + targetUrl);
            } else {
                System.out.println(">>> [SCREENSHOT] Capturing screenshot for slug: " + msg.getSlug());
            }

            byte[] pngBytes = (targetUrl != null && !targetUrl.isBlank())
                    ? screenshotService.captureScreenshotByUrl(targetUrl)
                    : screenshotService.captureScreenshot(msg.getSlug());
            System.out.println(">>> [SCREENSHOT] Screenshot captured — size: " + pngBytes.length + " bytes");

            // --- Upload to storage
            System.out.println(">>> [SCREENSHOT] Uploading to storage...");
            String screenshotUrl = screenshotStorageService.uploadScreenshot(msg.getPortfolioId(), pngBytes);
            System.out.println(">>> [SCREENSHOT] Uploaded — url: " + screenshotUrl);

            // --- Persist url to DB
            UUID portfolioId = UUID.fromString(msg.getPortfolioId());
            Portfolio portfolio = portfolioRepository.findById(portfolioId)
                    .orElseThrow(() -> new RuntimeException(
                            "Portfolio not found: " + portfolioId
                    ));
            portfolio.setScreenshotUrl(screenshotUrl);
            portfolioRepository.save(portfolio);
            System.out.println(">>> [SCREENSHOT] Saved to DB for portfolio: " + portfolioId);

            // --- Ack message
            channel.basicAck(deliveryTag, false);

            System.out.println(">>> [SCREENSHOT] Done for: " + msg.getSlug());
        } catch (Exception e) {
            System.err.println(">>> [SCREENSHOT] Failed for slug: " + msg.getSlug() + " | " + e.getMessage());

            // Reject and nack message
            channel.basicNack(deliveryTag, false, false);
        }
    }

}
