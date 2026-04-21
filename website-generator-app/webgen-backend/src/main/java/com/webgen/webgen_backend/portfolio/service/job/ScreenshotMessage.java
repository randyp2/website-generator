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
}
