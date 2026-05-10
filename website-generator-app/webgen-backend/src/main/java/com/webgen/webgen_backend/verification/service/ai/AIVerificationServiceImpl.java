package com.webgen.webgen_backend.verification.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
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
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class AIVerificationServiceImpl implements AIVerificationService {

    private static final Logger log = LoggerFactory.getLogger(AIVerificationServiceImpl.class);

    private static final String STATUS_ANALYZING = "analyzing";
    private static final String STATUS_COMPLETED = "completed";
    private static final String STATUS_FAILED = "failed";

    private static final String EVIDENCE_PROVIDER_MANUAL_UPLOAD = "manual_upload";
    private static final String EVIDENCE_TYPE_USER_UPLOADED_ASSET = "user_uploaded_asset";
    private static final String METADATA_VERIFICATION_KEY = "assetVerification";

    private static final int MAX_TEXT_BYTES = 250_000;
    private static final int MAX_TEXT_CHARS = 6_000;
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
    private final ObjectProvider<S3Client> s3ClientProvider;
    private final AssetVerificationPromptBuilder promptBuilder;
    private final AssetVerificationResponseParser responseParser;

    @Override
    public AssetVerificationResultDTO verify(AssetVerificationMessage message) {
        if (message == null) {
            throw new IllegalArgumentException("Asset verification message is required");
        }

        //  --- Validate profile, claim, upload ownership
        UUID profileId = parseUuid(message.getProfileId(), "profileId");
        UUID claimId = parseUuid(message.getClaimId(), "claimId");
        UUID uploadId = parseUuid(message.getUploadId(), "uploadId");

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

        markUploadAnalyzing(upload);

        // --- Call LLM to verify upload to claim
        try {
            AssetVerificationPromptBuilder.AssetFamily assetFamily = promptBuilder.resolveAssetFamily(
                    upload.getContentType(),
                    upload.getOriginalFileName()
            );

            String textExcerpt = extractTextExcerpt(upload, assetFamily);

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
                            textExcerpt
                    )
            );

            ChatResponse response = geminiAssetVerificationModel.call(prompt);
            response.getResult();
            String rawJson = response.getResult().getOutput().getText();

            AssetVerificationResponseParser.ParsedVerification parsed = responseParser.parse(rawJson);

            upsertEvidenceAndLink(profile, claim, upload, assetFamily, parsed);
            markUploadCompleted(upload, parsed, assetFamily, textExcerpt);

            return parsed.result();
        } catch (Exception e) {
            log.error("Asset verification failed for upload={} claim={}: {}", uploadId, claimId, e.getMessage(), e);
            markUploadFailed(upload, e.getMessage());

            if (e instanceof RuntimeException runtimeException) {
                throw runtimeException;
            }
            throw new RuntimeException("Asset verification failed", e);
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

        boolean shouldPersistLink = parsed.shouldLink()
                && safeConfidence(parsed.result().getConfidence()) >= MIN_LINK_CONFIDENCE;

        Optional<ClaimEvidenceLink> existingLinkOptional = claimEvidenceLinkRepository
                .findByProfileIdAndClaimIdAndEvidenceId(profile.getId(), claim.getId(), savedEvidence.getId());

        if (!shouldPersistLink) {
            existingLinkOptional.ifPresent(claimEvidenceLinkRepository::delete);
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
    }

    private void markUploadAnalyzing(ClaimEvidenceUpload upload) {
        upload.setStatus(STATUS_ANALYZING);
        upload.setAnalysisError(null);
        upload.setUpdatedAt(OffsetDateTime.now());
        claimEvidenceUploadRepository.save(upload);
    }

    private void markUploadCompleted(
            ClaimEvidenceUpload upload,
            AssetVerificationResponseParser.ParsedVerification parsed,
            AssetVerificationPromptBuilder.AssetFamily assetFamily,
            String textExcerpt
    ) {
        OffsetDateTime now = OffsetDateTime.now();
        upload.setStatus(STATUS_COMPLETED);
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
    }

    private void markUploadFailed(ClaimEvidenceUpload upload, String errorMessage) {
        OffsetDateTime now = OffsetDateTime.now();
        upload.setStatus(STATUS_FAILED);
        upload.setAnalysisError(truncate(Optional.ofNullable(errorMessage).orElse("Unknown verification error"), MAX_ERROR_LENGTH));
        upload.setUpdatedAt(now);

        ObjectNode metadata = asObjectNode(upload.getMetadata());
        ObjectNode verificationMetadata = objectMapper.createObjectNode();
        verificationMetadata.put("status", STATUS_FAILED);
        verificationMetadata.put("error", upload.getAnalysisError());
        verificationMetadata.put("failedAt", now.toString());
        metadata.set(METADATA_VERIFICATION_KEY, verificationMetadata);
        upload.setMetadata(metadata);

        claimEvidenceUploadRepository.save(upload);
    }

    private String extractTextExcerpt(
            ClaimEvidenceUpload upload,
            AssetVerificationPromptBuilder.AssetFamily assetFamily
    ) {
        if (assetFamily != AssetVerificationPromptBuilder.AssetFamily.TEXT) {
            return "";
        }

        Long size = upload.getFileSizeBytes();
        if (size != null && size > MAX_TEXT_BYTES) {
            return "";
        }

        S3Client s3Client = s3ClientProvider.getIfAvailable();
        if (s3Client == null) {
            return "";
        }

        try (ResponseInputStream<GetObjectResponse> objectStream = s3Client.getObject(
                GetObjectRequest.builder()
                        .bucket(upload.getStorageBucket())
                        .key(upload.getStorageKey())
                        .build()
        )) {
            byte[] bytes = objectStream.readNBytes(MAX_TEXT_BYTES);
            String raw = new String(bytes, StandardCharsets.UTF_8);
            String cleaned = raw
                    .replaceAll("\\p{Cntrl}", " ")
                    .replaceAll("\\s+", " ")
                    .trim();
            return truncate(cleaned, MAX_TEXT_CHARS);
        } catch (Exception e) {
            log.warn("Failed to extract text excerpt for upload {}: {}", upload.getId(), e.getMessage());
            return "";
        }
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

    private String truncate(String value, int maxLength) {
        if (value == null) {
            return "";
        }
        if (value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
