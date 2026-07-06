package com.webgen.webgen_backend.resume.service.quality;

/**
 * A concrete malformed parse signal produced by resume quality validation.
 *
 * @param code stable machine-readable issue code
 * @param detail human-readable context for logs and diagnostics
 */
public record ResumeParseQualityIssue(String code, String detail) {
    public ResumeParseQualityIssue {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Quality issue code is required");
        }
        detail = detail == null ? "" : detail;
    }
}
