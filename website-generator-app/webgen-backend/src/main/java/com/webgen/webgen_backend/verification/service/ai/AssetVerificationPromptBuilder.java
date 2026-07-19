package com.webgen.webgen_backend.verification.service.ai;

import org.springframework.ai.content.Media;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class AssetVerificationPromptBuilder {

    public enum AssetFamily {
        IMAGE,
        DOCUMENT,
        TEXT,
        GENERIC
    }

    public record PromptInput(
            String claimType,
            String claimRawValue,
            String claimSource,
            String originalFileName,
            String contentType,
            Long fileSizeBytes,
            String storageProvider,
            String storageKey,
            AssetFamily assetFamily,
            String extractedText,
            boolean imageAttached,
            String imageMimeType
    ) {
    }

    public Prompt buildPrompt(PromptInput input) {
        return buildPrompt(input, null);
    }

    public Prompt buildPrompt(PromptInput input, Media imageMedia) {
        String familySpecificInstructions = switch (input.assetFamily()) {
            case IMAGE -> """
                    Asset class: IMAGE
                    Focus on whether the image demonstrates real work/results related to the claim.
                    Prioritize the attached image pixels when present.
                    If image attachment is unavailable/unreadable, fall back to metadata and be conservative.
                    """;
            case DOCUMENT -> """
                    Asset class: DOCUMENT
                    Focus on whether this document likely supports the claim (certification, transcript, report,
                    project write-up, specification, or deliverable).
                    """;
            case TEXT -> """
                    Asset class: TEXT
                    Use the provided text excerpt as primary evidence and evaluate semantic alignment with the claim.
                    """;
            case GENERIC -> """
                    Asset class: GENERIC
                    Evaluate support using available metadata and any text excerpt if present.
                    """;
        };

        SystemMessage system = new SystemMessage("""
                You are a strict evidence verification analyst.
                Your task is to estimate how strongly an uploaded asset supports a user's claim.

                Return JSON only with this exact schema:
                {
                  "matchConfidence": 0.0,
                  "evidenceDepth": 0.0,
                  "summary": "short explanation",
                  "evidenceStrength": "DIRECT|STRONG|MODERATE|WEAK|NONE",
                  "shouldLink": true
                }

                Rules:
                - matchConfidence must be in [0,1] and measures whether the asset relates to the claim
                - evidenceDepth must be in [0,1] and measures demonstrated substantive skill usage
                - a clear skill mention can have high matchConfidence but low evidenceDepth
                - reserve high evidenceDepth for artifacts showing implementation, decisions, or meaningful results
                - summary must be concise and specific (max 220 chars)
                - choose evidenceStrength from the allowed enum only
                - shouldLink=false when matchConfidence is below 0.45 or the asset is unrelated
                - a related but shallow artifact may use evidenceStrength=WEAK with shouldLink=true
                - use NONE when the asset does not support the claim
                - avoid hallucinating content not present in metadata or excerpt
                - be conservative when evidence is incomplete

                %s
                """.formatted(familySpecificInstructions));

        UserMessage user = new UserMessage("""
                Claim context:
                - claimType: %s
                - claimRawValue: %s
                - claimSource: %s

                Asset metadata:
                - originalFileName: %s
                - contentType: %s
                - fileSizeBytes: %s
                - storageProvider: %s
                - storageKey: %s
                - assetFamily: %s

                Image attachment:
                - attached: %s
                - mimeType: %s

                Extracted text excerpt (may be empty for non-text assets):
                %s

                Evaluate whether this asset supports the claim and return JSON only.
                """.formatted(
                safe(input.claimType()),
                safe(input.claimRawValue()),
                safe(input.claimSource()),
                safe(input.originalFileName()),
                safe(input.contentType()),
                String.valueOf(input.fileSizeBytes()),
                safe(input.storageProvider()),
                safe(input.storageKey()),
                input.assetFamily().name(),
                input.imageAttached() ? "yes" : "no",
                safe(input.imageMimeType()),
                safe(input.extractedText())
        ));

        if (imageMedia != null) {
            user = UserMessage.builder()
                    .text(user.getText())
                    .media(imageMedia)
                    .build();
        }

        return new Prompt(List.of(system, user));
    }

    public AssetFamily resolveAssetFamily(String contentType, String originalFileName) {
        String normalizedContentType = normalize(contentType);
        String extension = resolveExtension(originalFileName);

        if (normalizedContentType.startsWith("image/")) {
            return AssetFamily.IMAGE;
        }

        if (normalizedContentType.startsWith("text/")
                || extension.matches("txt|md|csv|json|xml|yaml|yml|log|ini|toml")
                || extension.matches("java|kt|js|jsx|ts|tsx|py|go|rs|sql|sh|bash|zsh|html|css")) {
            return AssetFamily.TEXT;
        }

        if (normalizedContentType.contains("pdf")
                || normalizedContentType.contains("msword")
                || normalizedContentType.contains("officedocument")
                || extension.matches("pdf|doc|docx|ppt|pptx|xls|xlsx|rtf")) {
            return AssetFamily.DOCUMENT;
        }

        return AssetFamily.GENERIC;
    }

    private String resolveExtension(String originalFileName) {
        if (originalFileName == null || originalFileName.isBlank()) {
            return "";
        }
        int dot = originalFileName.lastIndexOf('.');
        if (dot < 0 || dot == originalFileName.length() - 1) {
            return "";
        }
        return originalFileName.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }
}
