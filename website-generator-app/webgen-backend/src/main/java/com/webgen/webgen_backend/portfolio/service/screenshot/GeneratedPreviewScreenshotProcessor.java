package com.webgen.webgen_backend.portfolio.service.screenshot;

import com.webgen.webgen_backend.portfolio.entity.GeneratedVersion;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.repository.GeneratedVersionRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import com.webgen.webgen_backend.portfolio.service.job.ScreenshotMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeneratedPreviewScreenshotProcessor {

    private final PortfolioRepository portfolioRepository;
    private final GeneratedVersionRepository generatedVersionRepository;
    private final GeneratedVersionHtmlRenderer htmlRenderer;
    private final ScreenshotService screenshotService;
    private final ScreenshotStorageService storageService;

    /** Captures and stores the generated version named by a screenshot job. */
    public void process(ScreenshotMessage message) {
        UUID portfolioId = UUID.fromString(message.getPortfolioId());
        UUID versionId = UUID.fromString(message.getGeneratedVersionId());
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new IllegalStateException("Portfolio not found: " + portfolioId));

        if (!versionId.equals(portfolio.getActiveVersionId())) {
            log.info(
                    "Skipping stale generated preview screenshot portfolioId={} versionId={} activeVersionId={}",
                    portfolioId,
                    versionId,
                    portfolio.getActiveVersionId()
            );
            return;
        }

        GeneratedVersion version = generatedVersionRepository
                .findByIdAndPortfolio_Id(versionId, portfolioId)
                .orElseThrow(() -> new IllegalStateException("Generated version not found: " + versionId));
        if (version.getPreviewUrl() != null && !version.getPreviewUrl().isBlank()) {
            log.info(
                    "Skipping completed generated preview screenshot portfolioId={} versionId={}",
                    portfolioId,
                    versionId
            );
            return;
        }

        String html = htmlRenderer.render(version, portfolio.getTitle());
        byte[] pngBytes = screenshotService.captureHtml(html);
        String previewUrl = storageService.uploadVersionPreview(
                portfolioId.toString(),
                versionId.toString(),
                pngBytes
        );

        version.setPreviewUrl(previewUrl);
        generatedVersionRepository.save(version);
        log.info(
                "Saved generated portfolio preview screenshot portfolioId={} versionId={} bytes={}",
                portfolioId,
                versionId,
                pngBytes.length
        );
    }
}
