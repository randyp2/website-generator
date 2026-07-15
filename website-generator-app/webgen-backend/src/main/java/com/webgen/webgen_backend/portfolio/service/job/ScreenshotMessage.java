package com.webgen.webgen_backend.portfolio.service.job;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
public class ScreenshotMessage {
    private String jobId;
    private String portfolioId;
    private String slug;
    private String targetUrl;
    /**
     * publishedVersionId at enqueue time. The worker drops the job when the
     * pin has moved on, so rapid version switches can never leave a stale
     * screenshot: only the job matching the current pin writes. Null skips
     * the check (external portfolios, which have no versions).
     */
    private String publishedVersionId;
    /**
     * Active generated version captured before publication. When present, the
     * worker renders the immutable version snapshot and stores a version-scoped
     * preview instead of updating the portfolio's published screenshot.
     */
    private String generatedVersionId;
    /** Verified external website captured before its portfolio row exists. */
    private String siteVerificationId;

    /** Creates a screenshot job for a published portfolio. */
    public static ScreenshotMessage forPortfolio(
            String portfolioId,
            String slug,
            String targetUrl,
            String publishedVersionId
    ) {
        ScreenshotMessage message = create();
        message.setPortfolioId(portfolioId);
        message.setSlug(slug);
        message.setTargetUrl(targetUrl);
        message.setPublishedVersionId(publishedVersionId);
        return message;
    }

    /** Creates a screenshot job for an unpublished generated version. */
    public static ScreenshotMessage forGeneratedVersion(String portfolioId, String generatedVersionId) {
        ScreenshotMessage message = create();
        message.setPortfolioId(portfolioId);
        message.setGeneratedVersionId(generatedVersionId);
        return message;
    }

    /** Creates a screenshot job for a verified external website. */
    public static ScreenshotMessage forSiteVerification(String siteVerificationId) {
        ScreenshotMessage message = create();
        message.setSiteVerificationId(siteVerificationId);
        return message;
    }

    private static ScreenshotMessage create() {
        ScreenshotMessage message = new ScreenshotMessage();
        message.setJobId(UUID.randomUUID().toString());
        return message;
    }
}
