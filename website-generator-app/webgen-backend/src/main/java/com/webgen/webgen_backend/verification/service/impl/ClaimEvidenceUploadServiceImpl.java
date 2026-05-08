package com.webgen.webgen_backend.verification.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.shared.config.R2Properties;
import com.webgen.webgen_backend.verification.dto.evidence.ClaimEvidenceUploadDTO;
import com.webgen.webgen_backend.verification.dto.evidence.ClaimEvidenceUploadListResponseDTO;
import com.webgen.webgen_backend.verification.dto.evidence.ClaimEvidenceUploadStatusResponseDTO;
import com.webgen.webgen_backend.verification.dto.evidence.CreateClaimEvidenceUploadPresignRequestDTO;
import com.webgen.webgen_backend.verification.dto.evidence.CreateClaimEvidenceUploadPresignResponseDTO;
import com.webgen.webgen_backend.verification.dto.evidence.FinalizeClaimEvidenceUploadRequestDTO;
import com.webgen.webgen_backend.verification.entity.Claim;
import com.webgen.webgen_backend.verification.entity.ClaimEvidenceUpload;
import com.webgen.webgen_backend.verification.repository.ClaimEvidenceUploadRepository;
import com.webgen.webgen_backend.verification.repository.ClaimRepository;
import com.webgen.webgen_backend.verification.service.ClaimEvidenceUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClaimEvidenceUploadServiceImpl implements ClaimEvidenceUploadService {

    private static final String STORAGE_PROVIDER_R2 = "r2";
    private static final String STATUS_UPLOADED = "uploaded";
    private static final String STATUS_QUEUED = "queued";
    private static final Duration PRESIGNED_URL_TTL = Duration.ofMinutes(15);

    private final ClaimEvidenceUploadRepository claimEvidenceUploadRepository;
    private final ClaimRepository claimRepository;
    private final ObjectMapper objectMapper;
    private final R2Properties r2Properties;
    private final ObjectProvider<S3Presigner> presignerProvider;
    private final ObjectProvider<S3Client> s3ClientProvider;

    @Override
    @Transactional
    public CreateClaimEvidenceUploadPresignResponseDTO createUploadPresign(
            UUID profileId,
            UUID claimId,
            CreateClaimEvidenceUploadPresignRequestDTO request
    ) {
        //--- Validate request payload and claim ownership
        validatePresignRequest(profileId, claimId, request);
        Claim claim = ensureClaimOwnedByProfile(profileId, claimId);
        S3Presigner presigner = resolvePresigner();
        Profile profile = claim.getProfile();

        //--- Create staged upload row and deterministic storage key
        OffsetDateTime now = OffsetDateTime.now();
        UUID uploadId = UUID.randomUUID();
        String bucket = r2Properties.getBucketName();
        String storageKey = buildStorageKey(profileId, claimId, uploadId, request.getOriginalFileName());

        ClaimEvidenceUpload upload = ClaimEvidenceUpload.builder()
                .id(uploadId)
                .profile(profile)
                .claimId(claimId)
                .storageProvider(STORAGE_PROVIDER_R2)
                .storageBucket(bucket)
                .storageKey(storageKey)
                .originalFileName(request.getOriginalFileName().trim())
                .contentType(request.getContentType().trim().toLowerCase(Locale.ROOT))
                .fileSizeBytes(request.getFileSizeBytes())
                .status(STATUS_UPLOADED)
                .analysisError(null)
                .metadata(objectMapper.createObjectNode())
                .createdAt(now)
                .updatedAt(now)
                .build();
        claimEvidenceUploadRepository.save(upload);

        //--- Build presigned PUT request payload for client upload
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(storageKey)
                .contentType(upload.getContentType())
                .contentLength(upload.getFileSizeBytes())
                .build();

        PresignedPutObjectRequest presignedPutObjectRequest = presigner.presignPutObject(
                PutObjectPresignRequest.builder()
                        .signatureDuration(PRESIGNED_URL_TTL)
                        .putObjectRequest(putObjectRequest)
                        .build()
        );

        return CreateClaimEvidenceUploadPresignResponseDTO.builder()
                .uploadId(upload.getId())
                .storageProvider(upload.getStorageProvider())
                .storageBucket(upload.getStorageBucket())
                .storageKey(upload.getStorageKey())
                .uploadUrl(presignedPutObjectRequest.url().toString())
                .expiresAt(now.plus(PRESIGNED_URL_TTL))
                .requiredHeaders(extractRequiredHeaders(presignedPutObjectRequest))
                .build();
    }

    @Override
    @Transactional
    public ClaimEvidenceUploadDTO finalizeUpload(
            UUID profileId,
            UUID claimId,
            FinalizeClaimEvidenceUploadRequestDTO request
    ) {
        //--- Validate finalize request and claim ownership
        validateFinalizeRequest(profileId, claimId, request);
        ensureClaimOwnedByProfile(profileId, claimId);
        S3Client s3Client = resolveS3Client();

        //--- Load staged upload row and verify ownership linkage
        ClaimEvidenceUpload upload = claimEvidenceUploadRepository
                .findByProfileIdAndId(profileId, request.getUploadId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Upload not found"));

        if (!claimId.equals(upload.getClaimId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Upload does not belong to claim");
        }

        //--- Verify object exists in storage before queueing AI analysis
        assertObjectExists(
                s3Client,
                upload.getStorageBucket(),
                upload.getStorageKey(),
                upload.getFileSizeBytes()
        );

        //--- Transition lifecycle status and persist finalize metadata
        upload.setStatus(STATUS_QUEUED);
        upload.setAnalysisError(null);
        upload.setMetadata(Optional.ofNullable(request.getMetadata()).orElseGet(objectMapper::createObjectNode));
        upload.setUpdatedAt(OffsetDateTime.now());

        ClaimEvidenceUpload saved = claimEvidenceUploadRepository.save(upload);
        return toDto(saved);
    }

    @Override
    public ClaimEvidenceUploadStatusResponseDTO getUploadStatus(
            UUID profileId,
            UUID claimId,
            UUID uploadId
    ) {
        validateUploadLookupRequest(profileId, claimId, uploadId);
        ensureClaimOwnedByProfile(profileId, claimId);

        ClaimEvidenceUpload upload = claimEvidenceUploadRepository.findByProfileIdAndId(profileId, uploadId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Upload not found"));
        if (!claimId.equals(upload.getClaimId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Upload does not belong to claim");
        }

        return ClaimEvidenceUploadStatusResponseDTO.builder()
                .uploadId(upload.getId())
                .status(upload.getStatus())
                .analysisError(upload.getAnalysisError())
                .updatedAt(upload.getUpdatedAt())
                .build();
    }

    @Override
    public ClaimEvidenceUploadListResponseDTO listClaimUploads(UUID profileId, UUID claimId) {
        validateClaimScopeRequest(profileId, claimId);
        ensureClaimOwnedByProfile(profileId, claimId);

        List<ClaimEvidenceUploadDTO> items = claimEvidenceUploadRepository
                .findByProfileIdAndClaimIdOrderByCreatedAtDesc(profileId, claimId)
                .stream()
                .map(this::toDto)
                .toList();

        return ClaimEvidenceUploadListResponseDTO.builder()
                .items(items)
                .nextCursor(null)
                .build();
    }

    private void validatePresignRequest(
            UUID profileId,
            UUID claimId,
            CreateClaimEvidenceUploadPresignRequestDTO request
    ) {
        validateClaimScopeRequest(profileId, claimId);
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (!StringUtils.hasText(request.getOriginalFileName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "originalFileName is required");
        }
        if (!StringUtils.hasText(request.getContentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "contentType is required");
        }
        if (request.getFileSizeBytes() == null || request.getFileSizeBytes() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fileSizeBytes must be >= 0");
        }
    }

    private void validateFinalizeRequest(
            UUID profileId,
            UUID claimId,
            FinalizeClaimEvidenceUploadRequestDTO request
    ) {
        validateClaimScopeRequest(profileId, claimId);
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (request.getUploadId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "uploadId is required");
        }
    }

    private void validateUploadLookupRequest(UUID profileId, UUID claimId, UUID uploadId) {
        validateClaimScopeRequest(profileId, claimId);
        if (uploadId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "uploadId is required");
        }
    }

    private void validateClaimScopeRequest(UUID profileId, UUID claimId) {
        if (profileId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "profileId is required");
        }
        if (claimId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "claimId is required");
        }
    }

    private Claim ensureClaimOwnedByProfile(UUID profileId, UUID claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Claim not found"));
        if (!profileId.equals(claim.getProfile().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your claim");
        }
        return claim;
    }

    private S3Presigner resolvePresigner() {
        if (!r2Properties.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "R2 is not enabled");
        }

        S3Presigner presigner = presignerProvider.getIfAvailable();
        if (presigner == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "R2 presigner bean is missing");
        }
        return presigner;
    }

    private S3Client resolveS3Client() {
        if (!r2Properties.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "R2 is not enabled");
        }

        S3Client s3Client = s3ClientProvider.getIfAvailable();
        if (s3Client == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "R2 client bean is missing");
        }
        return s3Client;
    }

    private void assertObjectExists(S3Client s3Client, String bucket, String key, Long expectedLength) {
        try {
            var headObjectResponse = s3Client.headObject(
                    HeadObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .build()
            );

            if (expectedLength != null
                    && headObjectResponse.contentLength() != null
                    && !expectedLength.equals(headObjectResponse.contentLength())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Uploaded object size mismatch");
            }
        } catch (S3Exception ex) {
            if (ex.statusCode() == HttpStatus.NOT_FOUND.value()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Uploaded object not found");
            }
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to validate uploaded object"
            );
        }
    }

    private String buildStorageKey(UUID profileId, UUID claimId, UUID uploadId, String originalFileName) {
        return "claims/" + profileId + "/" + claimId + "/" + uploadId + "/" + sanitizeFileName(originalFileName);
    }

    private String sanitizeFileName(String originalFileName) {
        String value = Optional.ofNullable(originalFileName).orElse("upload").trim();
        if (value.isEmpty()) {
            value = "upload";
        }

        int slashIndex = Math.max(value.lastIndexOf('/'), value.lastIndexOf('\\'));
        if (slashIndex >= 0 && slashIndex < value.length() - 1) {
            value = value.substring(slashIndex + 1);
        }
        value = value.replaceAll("[^A-Za-z0-9._-]", "-");
        value = value.replaceAll("-{2,}", "-");
        value = value.replaceAll("^[.-]+", "");
        return value.isBlank() ? "upload" : value;
    }

    private Map<String, String> extractRequiredHeaders(PresignedPutObjectRequest request) {
        Map<String, String> headers = new LinkedHashMap<>();
        request.httpRequest().headers().forEach((name, values) -> {
            if (values == null || values.isEmpty()) {
                return;
            }
            if ("host".equalsIgnoreCase(name)) {
                return;
            }
            headers.put(name, String.join(",", values));
        });
        return headers;
    }

    private ClaimEvidenceUploadDTO toDto(ClaimEvidenceUpload upload) {
        return ClaimEvidenceUploadDTO.builder()
                .id(upload.getId())
                .claimId(upload.getClaimId())
                .storageProvider(upload.getStorageProvider())
                .storageBucket(upload.getStorageBucket())
                .storageKey(upload.getStorageKey())
                .originalFileName(upload.getOriginalFileName())
                .contentType(upload.getContentType())
                .fileSizeBytes(upload.getFileSizeBytes())
                .status(upload.getStatus())
                .analysisError(upload.getAnalysisError())
                .metadata(upload.getMetadata())
                .createdAt(upload.getCreatedAt())
                .updatedAt(upload.getUpdatedAt())
                .build();
    }
}
