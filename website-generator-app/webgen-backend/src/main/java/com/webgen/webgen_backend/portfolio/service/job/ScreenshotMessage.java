package com.webgen.webgen_backend.portfolio.service.job;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
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
}
