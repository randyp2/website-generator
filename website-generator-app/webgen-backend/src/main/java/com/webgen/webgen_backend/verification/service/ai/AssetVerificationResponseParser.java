package com.webgen.webgen_backend.verification.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.verification.dto.job.AssetVerificationResultDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AssetVerificationResponseParser {

    private static final Set<String> ALLOWED_EVIDENCE_STRENGTHS = Set.of(
            "DIRECT",
            "STRONG",
            "MODERATE",
            "WEAK",
            "NONE"
    );

    private final ObjectMapper objectMapper;

    public record ParsedVerification(
            AssetVerificationResultDTO result,
            String evidenceStrength,
            String linkType,
            boolean shouldLink
    ) {
    }

    public ParsedVerification parse(String rawJson) {
        try {
            String normalized = normalizeJsonPayload(rawJson);
            JsonNode root = objectMapper.readTree(normalized);

            double confidence = clamp01(root.path("confidence").asDouble(0.0d));
            String summary = truncate(nonBlank(
                    root.path("summary").asText(""),
                    "Insufficient evidence signal was detected from this asset."
            ), 220);

            String evidenceStrength = normalizeEvidenceStrength(
                    root.path("evidenceStrength").asText(""),
                    root.path("linkType").asText("")
            );
            String linkType = mapEvidenceStrengthToLinkType(evidenceStrength);

            boolean shouldLinkRequested = root.has("shouldLink")
                    ? root.path("shouldLink").asBoolean(false)
                    : confidence >= 0.45d;
            boolean shouldLink = shouldLinkRequested && !"NONE".equals(evidenceStrength);

            AssetVerificationResultDTO result = AssetVerificationResultDTO.builder()
                    .confidence(confidence)
                    .summary(summary)
                    .build();

            return new ParsedVerification(result, evidenceStrength, linkType, shouldLink);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to parse asset verification response JSON", e);
        }
    }

    private String normalizeJsonPayload(String rawJson) {
        if (rawJson == null || rawJson.isBlank()) {
            throw new IllegalArgumentException("Asset verification model returned empty response");
        }

        String trimmed = rawJson.trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceFirst("^```[a-zA-Z]*\\s*", "");
            trimmed = trimmed.replaceFirst("\\s*```$", "");
        }
        return trimmed.trim();
    }

    private String normalizeEvidenceStrength(String evidenceStrength, String fallbackLinkType) {
        String normalizedStrength = evidenceStrength == null
                ? ""
                : evidenceStrength.trim().toUpperCase(Locale.ROOT);
        if (ALLOWED_EVIDENCE_STRENGTHS.contains(normalizedStrength)) {
            return normalizedStrength;
        }

        String normalizedLinkType = fallbackLinkType == null
                ? ""
                : fallbackLinkType.trim().toLowerCase(Locale.ROOT);
        return switch (normalizedLinkType) {
            case "dependency_match" -> "DIRECT";
            case "topic_match" -> "STRONG";
            case "name_match" -> "MODERATE";
            case "description_match", "language_plus_text_match" -> "WEAK";
            default -> "MODERATE";
        };
    }

    private String mapEvidenceStrengthToLinkType(String evidenceStrength) {
        return switch (evidenceStrength) {
            case "DIRECT" -> "dependency_match";
            case "STRONG" -> "topic_match";
            case "MODERATE" -> "name_match";
            case "WEAK" -> "description_match";
            case "NONE" -> "language_plus_text_match";
            default -> "name_match";
        };
    }

    private String nonBlank(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
    }

    private String truncate(String value, int maxLen) {
        if (value == null) {
            return "";
        }
        if (value.length() <= maxLen) {
            return value;
        }
        return value.substring(0, maxLen);
    }

    private double clamp01(double value) {
        if (Double.isNaN(value)) {
            return 0.0d;
        }
        return Math.max(0.0d, Math.min(1.0d, value));
    }
}
