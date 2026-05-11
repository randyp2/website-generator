package com.webgen.webgen_backend.verification.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import org.springframework.ai.content.Media;
import com.webgen.webgen_backend.verification.dto.job.AssetVerificationResultDTO;
import com.webgen.webgen_backend.verification.entity.Claim;
import com.webgen.webgen_backend.verification.entity.ClaimEvidenceLink;
import com.webgen.webgen_backend.verification.entity.ClaimEvidenceUpload;
import com.webgen.webgen_backend.verification.entity.Evidence;
import com.webgen.webgen_backend.verification.repository.ClaimEvidenceLinkRepository;
import com.webgen.webgen_backend.verification.repository.ClaimEvidenceUploadRepository;
import com.webgen.webgen_backend.verification.repository.ClaimRepository;
import com.webgen.webgen_backend.verification.repository.EvidenceRepository;
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

import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class AIVerificationServiceImpl implements AIVerificationService {

    private static final Logger log = LoggerFactory.getLogger(AIVerificationServiceImpl.class);

    private static final String STATUS_FAILED = "failed";

    private static final String EVIDENCE_PROVIDER_MANUAL_UPLOAD = "manual_upload";
    private static final String EVIDENCE_TYPE_USER_UPLOADED_ASSET = "user_uploaded_asset";
    private static final String METADATA_VERIFICATION_KEY = "assetVerification";

    private static final int MAX_ERROR_LENGTH = 500;
    private static final double MIN_LINK_CONFIDENCE = 0.30d;

    @Resource(name = "geminiAssetVerificationModel")
    private GoogleGenAiChatModel geminiAssetVerificationModel;

    private final ClaimRepository claimRepository;
    private final ProfileRepository profileRepository;
    private final ClaimEvidenceUploadRepository claimEvidenceUploadRepository;
    private final EvidenceRepository evidenceRepository;
    private final ClaimEvidenceLinkRepository claimEvidenceLinkRepository;
    private final ObjectMapper objectMapper;
    private final AssetVerificationPromptBuilder promptBuilder;
    private final AssetVerificationResponseParser responseParser;
    private final AssetContentExtractorService assetContentExtractorService;

    @Override
    public AssetVerificationResultDTO verify(AssetVerificationMessage message) {
        if (message == null) {
            throw new IllegalArgumentException("Asset verification message is required");
        }

        //  --- Validate profile, claim, upload ownership
        UUID profileId = parseUuid(message.getProfileId(), "profileId");
        UUID claimId = parseUuid(message.getClaimId(), "claimId");
        UUID uploadId = parseUuid(message.getUploadId(), "uploadId");
        System.out.println(">>> [ASSET-AI] verify start | jobId=" + message.getJobId()
                + " profileId=" + profileId
                + " claimId=" + claimId
                + " uploadId=" + uploadId);

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
        System.out.println(">>> [ASSET-AI] ownership validated | jobId=" + message.getJobId()
                + " fileName=" + upload.getOriginalFileName()
                + " contentType=" + upload.getContentType()
                + " fileSizeBytes=" + upload.getFileSizeBytes());

        // --- Call LLM to verify upload to claim
        try {
            AssetVerificationPromptBuilder.AssetFamily assetFamily = promptBuilder.resolveAssetFamily(
                    upload.getContentType(),
                    upload.getOriginalFileName()
            );
            System.out.println(">>> [ASSET-AI] asset family resolved | jobId=" + message.getJobId()
                    + " assetFamily=" + assetFamily
                    + " contentType=" + upload.getContentType());

            // --- Extract prompt-safe content by family (text, pdf) and fail soft when unavailable.
            String textExcerpt = assetContentExtractorService.extractPromptText(upload, assetFamily);
            System.out.println(">>> [ASSET-AI] text extracted | jobId=" + message.getJobId()
                    + " excerptLength=" + safeLength(textExcerpt));
            System.out.println(">>> [ASSET-AI] extracted text preview | jobId=" + message.getJobId()
                    + " preview=" + toPreview(textExcerpt));

            byte[] imageBytes = assetContentExtractorService.extractPromptImageBytes(upload, assetFamily);
            System.out.println(">>> [ASSET-AI] image bytes extracted | jobId=" + message.getJobId()
                    + " imageBytesLength=" + safeLength(imageBytes));
            Media imageMedia = buildImageMedia(upload, imageBytes);
            System.out.println(">>> [ASSET-AI] image media attachment | jobId=" + message.getJobId()
                    + " attached=" + (imageMedia != null)
                    + " mimeType=" + (imageMedia == null ? "" : imageMedia.getMimeType()));

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
            System.out.println(">>> [ASSET-AI] prompt built | jobId=" + message.getJobId());

            ChatResponse response = geminiAssetVerificationModel.call(prompt);
            response.getResult();
            String rawJson = response.getResult().getOutput().getText();
            System.out.println(">>> [ASSET-AI] model response received | jobId=" + message.getJobId()
                    + " rawLength=" + safeLength(rawJson));

            AssetVerificationResponseParser.ParsedVerification parsed = responseParser.parse(rawJson);
            System.out.println(">>> [ASSET-AI] parsed | jobId=" + message.getJobId()
                    + " confidence=" + parsed.result().getConfidence()
                    + " shouldLink=" + parsed.shouldLink()
                    + " linkType=" + parsed.linkType()
                    + " evidenceStrength=" + parsed.evidenceStrength()
                    + " summaryLength=" + safeLength(parsed.result().getSummary()));

            upsertEvidenceAndLink(profile, claim, upload, assetFamily, parsed);
            markUploadCompleted(upload, parsed, assetFamily, textExcerpt);
            System.out.println(">>> [ASSET-AI] verify complete | jobId=" + message.getJobId()
                    + " uploadId=" + uploadId);

            return parsed.result();
        } catch (Exception e) {
            log.error("Asset verification failed for upload={} claim={}: {}", uploadId, claimId, e.getMessage(), e);
            System.err.println(">>> [ASSET-AI] verify failed | jobId=" + message.getJobId()
                    + " uploadId=" + uploadId
                    + " error=" + e.getMessage());
            markUploadFailed(upload, e.getMessage());

            throw (RuntimeException) e;
        }
    }

    private void upsertEvidenceAndLink(
            Profile profile,
            Claim claim,
            ClaimEvidenceUpload upload,
            AssetVerificationPromptBuilder.AssetFamily assetFamily,
            AssetVerificationResponseParser.ParsedVerification parsed
    ) {
        OffsetDateTime now = OffsetDateTime.now();
        String externalId = upload.getId().toString();

        Evidence evidence = evidenceRepository
                .findByProfileIdAndProviderAndExternalId(profile.getId(), EVIDENCE_PROVIDER_MANUAL_UPLOAD, externalId)
                .orElseGet(() -> Evidence.builder()
                        .id(UUID.randomUUID())
                        .profile(profile)
                        .provider(EVIDENCE_PROVIDER_MANUAL_UPLOAD)
                        .externalId(externalId)
                        .createdAt(now)
                        .build());

        evidence.setEvidenceType(EVIDENCE_TYPE_USER_UPLOADED_ASSET);
        evidence.setTitle(upload.getOriginalFileName());
        evidence.setDescription(parsed.result().getSummary());
        evidence.setSourceUrl(null);
        evidence.setOccurredAt(upload.getCreatedAt());
        evidence.setCapturedAt(now);
        evidence.setUpdatedAt(now);

        ObjectNode evidenceMetadata = asObjectNode(evidence.getMetadata());
        evidenceMetadata.put("uploadId", upload.getId().toString());
        evidenceMetadata.put("claimId", claim.getId().toString());
        evidenceMetadata.put("storageProvider", upload.getStorageProvider());
        evidenceMetadata.put("storageBucket", upload.getStorageBucket());
        evidenceMetadata.put("storageKey", upload.getStorageKey());
        evidenceMetadata.put("contentType", Optional.ofNullable(upload.getContentType()).orElse(""));
        evidenceMetadata.put("assetFamily", assetFamily.name());
        evidenceMetadata.put("aiConfidence", safeConfidence(parsed.result().getConfidence()));
        evidenceMetadata.put("aiSummary", Optional.ofNullable(parsed.result().getSummary()).orElse(""));
        evidenceMetadata.put("aiEvidenceStrength", parsed.evidenceStrength());
        evidenceMetadata.put("aiLinkType", parsed.linkType());
        evidenceMetadata.put("aiShouldLink", parsed.shouldLink());
        evidenceMetadata.put("updatedAt", now.toString());
        evidence.setMetadata(evidenceMetadata);

        Evidence savedEvidence = evidenceRepository.save(evidence);
        System.out.println(">>> [ASSET-AI] evidence saved | profileId=" + profile.getId()
                + " claimId=" + claim.getId()
                + " evidenceId=" + savedEvidence.getId()
                + " provider=" + savedEvidence.getProvider());

        boolean shouldPersistLink = parsed.shouldLink()
                && safeConfidence(parsed.result().getConfidence()) >= MIN_LINK_CONFIDENCE;
        System.out.println(">>> [ASSET-AI] link decision | claimId=" + claim.getId()
                + " evidenceId=" + savedEvidence.getId()
                + " shouldPersistLink=" + shouldPersistLink);

        Optional<ClaimEvidenceLink> existingLinkOptional = claimEvidenceLinkRepository
                .findByProfileIdAndClaimIdAndEvidenceId(profile.getId(), claim.getId(), savedEvidence.getId());

        if (!shouldPersistLink) {
            existingLinkOptional.ifPresent(claimEvidenceLinkRepository::delete);
            System.out.println(">>> [ASSET-AI] link removed/skipped | claimId=" + claim.getId()
                    + " evidenceId=" + savedEvidence.getId());
            return;
        }

        ClaimEvidenceLink link = existingLinkOptional.orElseGet(() -> ClaimEvidenceLink.builder()
                .id(UUID.randomUUID())
                .profile(profile)
                .claimId(claim.getId())
                .evidenceId(savedEvidence.getId())
                .createdAt(now)
                .build());

        link.setLinkType(parsed.linkType());
        link.setLinkConfidence(
                BigDecimal.valueOf(safeConfidence(parsed.result().getConfidence()))
                        .setScale(3, RoundingMode.HALF_UP)
        );
        link.setReason(null);
        link.setUpdatedAt(now);

        ObjectNode linkMetadata = asObjectNode(link.getMetadata());
        linkMetadata.put("source", "gemini_asset_verification");
        linkMetadata.put("uploadId", upload.getId().toString());
        linkMetadata.put("assetFamily", assetFamily.name());
        linkMetadata.put("aiSummary", Optional.ofNullable(parsed.result().getSummary()).orElse(""));
        linkMetadata.put("updatedAt", now.toString());
        link.setMetadata(linkMetadata);

        claimEvidenceLinkRepository.save(link);
        System.out.println(">>> [ASSET-AI] link saved | claimId=" + claim.getId()
                + " evidenceId=" + savedEvidence.getId()
                + " linkType=" + link.getLinkType()
                + " linkConfidence=" + link.getLinkConfidence());
    }

    private void markUploadCompleted(
            ClaimEvidenceUpload upload,
            AssetVerificationResponseParser.ParsedVerification parsed,
            AssetVerificationPromptBuilder.AssetFamily assetFamily,
            String textExcerpt
    ) {
        OffsetDateTime now = OffsetDateTime.now();
        upload.setAnalysisError(null);
        upload.setUpdatedAt(now);

        ObjectNode metadata = asObjectNode(upload.getMetadata());
        ObjectNode verificationMetadata = objectMapper.createObjectNode();
        verificationMetadata.put("confidence", safeConfidence(parsed.result().getConfidence()));
        verificationMetadata.put("summary", Optional.ofNullable(parsed.result().getSummary()).orElse(""));
        verificationMetadata.put("evidenceStrength", parsed.evidenceStrength());
        verificationMetadata.put("linkType", parsed.linkType());
        verificationMetadata.put("shouldLink", parsed.shouldLink());
        verificationMetadata.put("assetFamily", assetFamily.name());
        verificationMetadata.put("textExcerptIncluded", textExcerpt != null && !textExcerpt.isBlank());
        verificationMetadata.put("verifiedAt", now.toString());
        metadata.set(METADATA_VERIFICATION_KEY, verificationMetadata);

        upload.setMetadata(metadata);
        claimEvidenceUploadRepository.save(upload);
        System.out.println(">>> [ASSET-AI] upload metadata updated | uploadId=" + upload.getId()
                + " verifiedAt=" + now);
    }

    private void markUploadFailed(ClaimEvidenceUpload upload, String errorMessage) {
        OffsetDateTime now = OffsetDateTime.now();
        upload.setAnalysisError(truncate(Optional.ofNullable(errorMessage).orElse("Unknown verification error")));
        upload.setUpdatedAt(now);

        ObjectNode metadata = asObjectNode(upload.getMetadata());
        ObjectNode verificationMetadata = objectMapper.createObjectNode();
        verificationMetadata.put("status", STATUS_FAILED);
        verificationMetadata.put("error", upload.getAnalysisError());
        verificationMetadata.put("failedAt", now.toString());
        metadata.set(METADATA_VERIFICATION_KEY, verificationMetadata);
        upload.setMetadata(metadata);

        claimEvidenceUploadRepository.save(upload);
        System.out.println(">>> [ASSET-AI] upload failure metadata updated | uploadId=" + upload.getId()
                + " error=" + upload.getAnalysisError());
    }

    private ObjectNode asObjectNode(JsonNode node) {
        if (node instanceof ObjectNode objectNode) {
            return objectNode.deepCopy();
        }
        return objectMapper.createObjectNode();
    }

    private UUID parseUuid(String value, String fieldName) {
        try {
            return UUID.fromString(value);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid " + fieldName + " in asset verification message", e);
        }
    }

    private double safeConfidence(Double confidence) {
        if (confidence == null || confidence.isNaN()) {
            return 0.0d;
        }
        return Math.max(0.0d, Math.min(1.0d, confidence));
    }

    private String truncate(String value) {
        if (value == null) {
            return "";
        }
        if (value.length() <= AIVerificationServiceImpl.MAX_ERROR_LENGTH) {
            return value;
        }
        return value.substring(0, AIVerificationServiceImpl.MAX_ERROR_LENGTH);
    }

    private int safeLength(String value) {
        return value == null ? 0 : value.length();
    }

    private int safeLength(byte[] value) {
        return value == null ? 0 : value.length;
    }

    private String toPreview(String value) {
        if (value == null || value.isBlank()) {
            return "(none)";
        }

        String normalized = value
                .replace("\n", "\\n")
                .replace("\r", "\\r");
        int max = 400;
        if (normalized.length() <= max) {
            return normalized;
        }
        return normalized.substring(0, max) + "...";
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
