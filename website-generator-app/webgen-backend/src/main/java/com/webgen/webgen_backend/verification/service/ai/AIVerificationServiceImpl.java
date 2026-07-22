package com.webgen.webgen_backend.verification.service.ai;

import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import org.springframework.ai.content.Media;
import com.webgen.webgen_backend.verification.dto.job.AssetVerificationResultDTO;
import com.webgen.webgen_backend.verification.entity.Claim;
import com.webgen.webgen_backend.verification.entity.ClaimEvidenceUpload;
import com.webgen.webgen_backend.verification.repository.ClaimEvidenceUploadRepository;
import com.webgen.webgen_backend.verification.repository.ClaimRepository;
import com.webgen.webgen_backend.verification.service.job.AssetVerificationMessage;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeType;
import org.springframework.util.MimeTypeUtils;

import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AIVerificationServiceImpl implements AIVerificationService {

    private static final Logger log = LoggerFactory.getLogger(AIVerificationServiceImpl.class);

    @Resource(name = "geminiAssetVerificationModel")
    private GoogleGenAiChatModel geminiAssetVerificationModel;

    private final ClaimRepository claimRepository;
    private final ProfileRepository profileRepository;
    private final ClaimEvidenceUploadRepository claimEvidenceUploadRepository;
    private final AssetVerificationPromptBuilder promptBuilder;
    private final AssetVerificationResponseParser responseParser;
    private final AssetContentExtractorService assetContentExtractorService;
    private final AssetVerificationPersistenceService persistenceService;

    @Override
    public AssetVerificationResultDTO verify(AssetVerificationMessage message) {
        if (message == null) {
            throw new IllegalArgumentException("Asset verification message is required");
        }

        //  --- Validate profile, claim, upload ownership
        UUID profileId = parseUuid(message.getProfileId(), "profileId");
        UUID claimId = parseUuid(message.getClaimId(), "claimId");
        UUID uploadId = parseUuid(message.getUploadId(), "uploadId");
        log.debug("Asset verification start jobId={} profileId={} claimId={} uploadId={}",
                message.getJobId(), profileId, claimId, uploadId);

        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for verification job"));

        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found for verification job"));
        if (claim.getProfile() == null || !profileId.equals(claim.getProfile().getId())) {
            throw new IllegalArgumentException("Claim does not belong to verification profile");
        }

        ClaimEvidenceUpload upload = claimEvidenceUploadRepository.findByProfileIdAndId(profileId, uploadId)
                .orElseThrow(() -> new IllegalArgumentException("Upload not found for verification job"));
        if (!Objects.equals(upload.getClaimId(), claimId)) {
            throw new IllegalArgumentException("Upload does not belong to claim from verification message");
        }

        // --- Call LLM to verify upload to claim
        try {
            AssetVerificationPromptBuilder.AssetFamily assetFamily = promptBuilder.resolveAssetFamily(
                    upload.getContentType(),
                    upload.getOriginalFileName()
            );

            // --- Extract prompt-safe content by family (text, pdf) and fail soft when unavailable.
            String textExcerpt = assetContentExtractorService.extractPromptText(upload, assetFamily);
            byte[] imageBytes = assetContentExtractorService.extractPromptImageBytes(upload, assetFamily);
            Media imageMedia = buildImageMedia(upload, imageBytes);

            Prompt prompt = promptBuilder.buildPrompt(
                    new AssetVerificationPromptBuilder.PromptInput(
                            claim.getClaimType(),
                            claim.getRawValue(),
                            claim.getSource(),
                            upload.getOriginalFileName(),
                            upload.getContentType(),
                            upload.getFileSizeBytes(),
                            upload.getStorageProvider(),
                            upload.getStorageKey(),
                            assetFamily,
                            textExcerpt,
                            imageMedia != null,
                            imageMedia == null ? "" : imageMedia.getMimeType().toString()
                    ),
                    imageMedia
            );

            ChatResponse response = geminiAssetVerificationModel.call(prompt);
            response.getResult();
            String rawJson = response.getResult().getOutput().getText();

            AssetVerificationResponseParser.ParsedVerification parsed = responseParser.parse(rawJson);
            log.info("Asset verification parsed jobId={} matchConfidence={} evidenceDepth={} "
                            + "shouldLink={} linkType={} evidenceStrength={} summaryLength={}",
                    message.getJobId(), parsed.result().getMatchConfidence(),
                    parsed.result().getEvidenceDepth(), parsed.shouldLink(), parsed.linkType(),
                    parsed.evidenceStrength(), safeLength(parsed.result().getSummary()));

            persistenceService.persistSuccess(profile, claim, upload, assetFamily, parsed, textExcerpt);

            return parsed.result();
        } catch (Exception e) {
            log.error("Asset verification failed for upload={} claim={}: {}", uploadId, claimId, e.getMessage(), e);
            persistenceService.persistFailure(upload, e.getMessage());

            if (e instanceof RuntimeException runtimeException) {
                throw runtimeException;
            }
            throw new IllegalStateException("Asset verification failed", e);
        }
    }

    private UUID parseUuid(String value, String fieldName) {
        try {
            return UUID.fromString(value);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid " + fieldName + " in asset verification message", e);
        }
    }

    private int safeLength(String value) {
        return value == null ? 0 : value.length();
    }

    private Media buildImageMedia(ClaimEvidenceUpload upload, byte[] imageBytes) {
        if (upload == null || imageBytes == null || imageBytes.length == 0) {
            return null;
        }

        MimeType mimeType = resolveImageMimeType(upload.getContentType(), upload.getOriginalFileName());
        return Media.builder()
                .mimeType(mimeType)
                .data(new ByteArrayResource(imageBytes))
                .build();
    }

    private MimeType resolveImageMimeType(String contentType, String originalFileName) {
        String normalizedContentType = contentType == null ? "" : contentType.trim().toLowerCase(Locale.ROOT);
        if (normalizedContentType.startsWith("image/")) {
            try {
                return MimeType.valueOf(normalizedContentType);
            } catch (Exception ignored) {
                // Fall through to extension-based fallback.
            }
        }

        String extension = resolveExtension(originalFileName);
        return switch (extension) {
            case "png" -> MimeTypeUtils.IMAGE_PNG;
            case "jpg", "jpeg" -> MimeTypeUtils.IMAGE_JPEG;
            case "gif" -> MimeType.valueOf("image/gif");
            case "webp" -> MimeType.valueOf("image/webp");
            case "svg" -> MimeType.valueOf("image/svg+xml");
            default -> MimeTypeUtils.IMAGE_JPEG;
        };
    }

    private String resolveExtension(String originalFileName) {
        if (originalFileName == null || originalFileName.isBlank()) {
            return "";
        }

        int dotIndex = originalFileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex >= originalFileName.length() - 1) {
            return "";
        }

        return originalFileName.substring(dotIndex + 1).trim().toLowerCase(Locale.ROOT);
    }
}
