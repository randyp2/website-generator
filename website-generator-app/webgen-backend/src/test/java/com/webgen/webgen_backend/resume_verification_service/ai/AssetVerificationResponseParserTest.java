package com.webgen.webgen_backend.resume_verification_service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.verification.service.ai.AssetVerificationResponseParser;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AssetVerificationResponseParserTest {

    private final AssetVerificationResponseParser parser =
            new AssetVerificationResponseParser(new ObjectMapper());

    @Test
    void parsesMatchConfidenceAndEvidenceDepthIndependently() {
        var parsed = parser.parse("""
                {
                  "matchConfidence": 0.97,
                  "evidenceDepth": 0.32,
                  "summary": "React is named clearly but substantive implementation is not shown.",
                  "evidenceStrength": "WEAK",
                  "shouldLink": true
                }
                """);

        assertThat(parsed.result().getMatchConfidence()).isEqualTo(0.97);
        assertThat(parsed.result().getEvidenceDepth()).isEqualTo(0.32);
        assertThat(parsed.shouldLink()).isTrue();
    }

    @Test
    void supportsLegacyConfidenceResponsesForQueuedOlderJobs() {
        var parsed = parser.parse("""
                {
                  "confidence": 0.74,
                  "summary": "Legacy response.",
                  "evidenceStrength": "MODERATE",
                  "shouldLink": true
                }
                """);

        assertThat(parsed.result().getMatchConfidence()).isEqualTo(0.74);
        assertThat(parsed.result().getEvidenceDepth()).isEqualTo(0.74);
    }
}
