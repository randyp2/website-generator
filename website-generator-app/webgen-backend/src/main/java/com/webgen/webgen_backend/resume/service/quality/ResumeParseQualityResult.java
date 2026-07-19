package com.webgen.webgen_backend.resume.service.quality;

import java.util.List;

/**
 * Quality validation result for a parsed resume.
 *
 * @param acceptable true when no malformed parse signals were found
 * @param issues immutable list of malformed parse signals
 */
public record ResumeParseQualityResult(boolean acceptable, List<ResumeParseQualityIssue> issues) {
    public ResumeParseQualityResult {
        issues = issues == null ? List.of() : List.copyOf(issues);
        acceptable = acceptable && issues.isEmpty();
    }

    public static ResumeParseQualityResult accept() {
        return new ResumeParseQualityResult(true, List.of());
    }

    public static ResumeParseQualityResult reject(List<ResumeParseQualityIssue> issues) {
        return new ResumeParseQualityResult(false, issues);
    }
}
