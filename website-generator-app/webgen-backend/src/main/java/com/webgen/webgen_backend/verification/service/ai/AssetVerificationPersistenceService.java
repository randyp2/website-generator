package com.webgen.webgen_backend.verification.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.verification.entity.Claim;
import com.webgen.webgen_backend.verification.entity.ClaimEvidenceLink;
import com.webgen.webgen_backend.verification.entity.ClaimEvidenceUpload;
import com.webgen.webgen_backend.verification.entity.Evidence;
import com.webgen.webgen_backend.verification.repository.ClaimEvidenceLinkRepository;
import com.webgen.webgen_backend.verification.repository.ClaimEvidenceUploadRepository;
import com.webgen.webgen_backend.verification.repository.EvidenceRepository;
import com.webgen.webgen_backend.verification.service.ClaimVerificationStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Persists AI review results and their claim-evidence lifecycle atomically. */
@Slf4j
@Service
@RequiredArgsConstructor
public class AssetVerificationPersistenceService {
    private static final String PROVIDER = "manual_upload";
    private static final String EVIDENCE_TYPE = "user_uploaded_asset";
    private static final String METADATA_KEY = "assetVerification";
    private static final double MIN_LINK_CONFIDENCE = 0.30d;
    private static final int MAX_ERROR_LENGTH = 500;

    private final ClaimEvidenceUploadRepository uploadRepository;
    private final EvidenceRepository evidenceRepository;
    private final ClaimEvidenceLinkRepository linkRepository;
    private final ObjectMapper objectMapper;
    private final ClaimVerificationStatusService statusService;

    @Transactional
    public void persistSuccess(
            Profile profile,
            Claim claim,
            ClaimEvidenceUpload upload,
            AssetVerificationPromptBuilder.AssetFamily assetFamily,
            AssetVerificationResponseParser.ParsedVerification parsed,
            String textExcerpt
    ) {
        Evidence evidence = upsertEvidence(profile, claim, upload, assetFamily, parsed);
        upsertLink(profile, claim, upload, evidence, assetFamily, parsed);
        completeUpload(upload, parsed, assetFamily, textExcerpt);
        statusService.reconcileClaims(profile.getId(), List.of(claim.getId()));
    }

    @Transactional
    public void persistFailure(ClaimEvidenceUpload upload, String errorMessage) {
        OffsetDateTime now = OffsetDateTime.now();
        upload.setStatus("failed");
        upload.setAnalysisError(abbreviate(Optional.ofNullable(errorMessage)
                .orElse("Unknown verification error")));
        upload.setUpdatedAt(now);
        ObjectNode metadata = asObjectNode(upload.getMetadata());
        ObjectNode result = objectMapper.createObjectNode();
        result.put("status", "failed");
        result.put("error", upload.getAnalysisError());
        result.put("failedAt", now.toString());
        metadata.set(METADATA_KEY, result);
        upload.setMetadata(metadata);
        uploadRepository.save(upload);
        log.warn("Asset verification persistence failed uploadId={} reason={}",
                upload.getId(), upload.getAnalysisError());
    }

    private Evidence upsertEvidence(
            Profile profile,
            Claim claim,
            ClaimEvidenceUpload upload,
            AssetVerificationPromptBuilder.AssetFamily assetFamily,
            AssetVerificationResponseParser.ParsedVerification parsed
    ) {
        OffsetDateTime now = OffsetDateTime.now();
        Evidence evidence = evidenceRepository
                .findByProfileIdAndProviderAndExternalId(profile.getId(), PROVIDER, upload.getId().toString())
                .orElseGet(() -> Evidence.builder().id(UUID.randomUUID()).profile(profile)
                        .provider(PROVIDER).externalId(upload.getId().toString()).createdAt(now).build());
        double matchConfidence = bounded(parsed.result().getMatchConfidence());
        double evidenceDepth = bounded(parsed.result().getEvidenceDepth());
        evidence.setSourceUploadId(upload.getId());
        evidence.setEvidenceType(EVIDENCE_TYPE);
        evidence.setTitle(upload.getOriginalFileName());
        evidence.setDescription(parsed.result().getSummary());
        evidence.setSourceUrl(null);
        evidence.setOccurredAt(upload.getCreatedAt());
        evidence.setCapturedAt(now);
        evidence.setUpdatedAt(now);
        ObjectNode metadata = asObjectNode(evidence.getMetadata());
        metadata.put("uploadId", upload.getId().toString());
        metadata.put("claimId", claim.getId().toString());
        metadata.put("storageProvider", upload.getStorageProvider());
        metadata.put("storageBucket", upload.getStorageBucket());
        metadata.put("storageKey", upload.getStorageKey());
        metadata.put("contentType", Optional.ofNullable(upload.getContentType()).orElse(""));
        metadata.put("assetFamily", assetFamily.name());
        metadata.put("aiMatchConfidence", matchConfidence);
        metadata.put("aiEvidenceDepth", evidenceDepth);
        metadata.put("aiConfidence", matchConfidence);
        metadata.put("aiSummary", Optional.ofNullable(parsed.result().getSummary()).orElse(""));
        metadata.put("aiEvidenceStrength", parsed.evidenceStrength());
        metadata.put("aiLinkType", parsed.linkType());
        metadata.put("aiShouldLink", parsed.shouldLink());
        metadata.put("updatedAt", now.toString());
        evidence.setMetadata(metadata);
        return evidenceRepository.save(evidence);
    }

    private void upsertLink(
            Profile profile,
            Claim claim,
            ClaimEvidenceUpload upload,
            Evidence evidence,
            AssetVerificationPromptBuilder.AssetFamily assetFamily,
            AssetVerificationResponseParser.ParsedVerification parsed
    ) {
        double matchConfidence = bounded(parsed.result().getMatchConfidence());
        double evidenceDepth = bounded(parsed.result().getEvidenceDepth());
        Optional<ClaimEvidenceLink> existing = linkRepository
                .findByProfileIdAndClaimIdAndEvidenceId(profile.getId(), claim.getId(), evidence.getId());
        boolean shouldLink = parsed.shouldLink() && matchConfidence >= MIN_LINK_CONFIDENCE;
        log.info("Asset evidence link decision claimId={} evidenceId={} matchConfidence={} "
                        + "evidenceDepth={} threshold={} shouldPersist={}",
                claim.getId(), evidence.getId(), matchConfidence, evidenceDepth,
                MIN_LINK_CONFIDENCE, shouldLink);
        if (!shouldLink) {
            existing.ifPresent(linkRepository::delete);
            return;
        }
        OffsetDateTime now = OffsetDateTime.now();
        ClaimEvidenceLink link = existing.orElseGet(() -> ClaimEvidenceLink.builder()
                .id(UUID.randomUUID()).profile(profile).claimId(claim.getId())
                .evidenceId(evidence.getId()).createdAt(now).build());
        link.setLinkType(parsed.linkType());
        link.setLinkConfidence(decimal(matchConfidence));
        link.setEvidenceDepth(decimal(evidenceDepth));
        link.setReason(null);
        link.setUpdatedAt(now);
        ObjectNode metadata = asObjectNode(link.getMetadata());
        metadata.put("source", "gemini_asset_verification");
        metadata.put("uploadId", upload.getId().toString());
        metadata.put("assetFamily", assetFamily.name());
        metadata.put("matchConfidence", matchConfidence);
        metadata.put("evidenceDepth", evidenceDepth);
        metadata.put("aiSummary", Optional.ofNullable(parsed.result().getSummary()).orElse(""));
        metadata.put("updatedAt", now.toString());
        link.setMetadata(metadata);
        linkRepository.save(link);
    }

    private void completeUpload(
            ClaimEvidenceUpload upload,
            AssetVerificationResponseParser.ParsedVerification parsed,
            AssetVerificationPromptBuilder.AssetFamily assetFamily,
            String textExcerpt
    ) {
        OffsetDateTime now = OffsetDateTime.now();
        upload.setAnalysisError(null);
        upload.setStatus("completed");
        upload.setUpdatedAt(now);
        double matchConfidence = bounded(parsed.result().getMatchConfidence());
        double evidenceDepth = bounded(parsed.result().getEvidenceDepth());
        ObjectNode metadata = asObjectNode(upload.getMetadata());
        ObjectNode result = objectMapper.createObjectNode();
        result.put("matchConfidence", matchConfidence);
        result.put("evidenceDepth", evidenceDepth);
        result.put("confidence", matchConfidence);
        result.put("summary", Optional.ofNullable(parsed.result().getSummary()).orElse(""));
        result.put("evidenceStrength", parsed.evidenceStrength());
        result.put("linkType", parsed.linkType());
        result.put("shouldLink", parsed.shouldLink());
        result.put("assetFamily", assetFamily.name());
        result.put("textExcerptIncluded", textExcerpt != null && !textExcerpt.isBlank());
        result.put("verifiedAt", now.toString());
        metadata.set(METADATA_KEY, result);
        upload.setMetadata(metadata);
        uploadRepository.save(upload);
    }

    private ObjectNode asObjectNode(JsonNode node) {
        return node instanceof ObjectNode objectNode
                ? objectNode.deepCopy()
                : objectMapper.createObjectNode();
    }

    private BigDecimal decimal(double value) {
        return BigDecimal.valueOf(value).setScale(3, RoundingMode.HALF_UP);
    }

    private double bounded(Double value) {
        if (value == null || value.isNaN()) return 0.0d;
        return Math.max(0.0d, Math.min(1.0d, value));
    }

    private String abbreviate(String value) {
        if (value == null) return "";
        return value.substring(0, Math.min(MAX_ERROR_LENGTH, value.length()));
    }
}
