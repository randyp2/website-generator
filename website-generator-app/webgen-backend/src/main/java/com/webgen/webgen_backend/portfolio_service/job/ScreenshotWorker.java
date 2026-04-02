package com.webgen.webgen_backend.portfolio_service.job;

import com.rabbitmq.client.Channel;
import com.webgen.webgen_backend.config.RabbitMQConfig;
import com.webgen.webgen_backend.entity.Portfolio;
import com.webgen.webgen_backend.portfolio_service.screenshot.ScreenshotService;
import com.webgen.webgen_backend.portfolio_service.screenshot.ScreenshotStorageService;
import com.webgen.webgen_backend.repository.PortfolioRepository;
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
            // --- Capture screenshot via Playwright
            byte[] pngBytes = screenshotService.captureScreenshot(msg.getSlug());

            // --- Upload to storage
            String screenshotUrl = screenshotStorageService.uploadScreenshot(msg.getPortfolioId(), pngBytes);

            // --- Persist url to DB
            UUID portfolioId = UUID.fromString(msg.getPortfolioId());
            Portfolio portfolio = portfolioRepository.findById(portfolioId)
                    .orElseThrow(() -> new RuntimeException(
                            "Portfolio not found: " + portfolioId
                    ));
            portfolio.setScreenshotUrl(screenshotUrl);
            portfolioRepository.save(portfolio);

            // --- Ack message
            channel.basicAck(deliveryTag, false);

            System.out.println(">>> [SCREENSHOT] Captured for: " + msg.getSlug());
        } catch (Exception e) {
            System.err.println(">>> [SCREENSHOT] Failed for slug: " + msg.getSlug() + " | " + e.getMessage());

            // Reject and nack message
            channel.basicNack(deliveryTag, false, false);
        }
    }

}
