package com.webgen.webgen_backend.portfolio.service.upload;

import com.webgen.webgen_backend.portfolio.dto.upload.PortfolioUploadDescriptorDTO;
import com.webgen.webgen_backend.portfolio.dto.upload.PortfolioUploadKind;
import com.webgen.webgen_backend.portfolio.dto.upload.PortfolioUploadedAssetDTO;
import com.webgen.webgen_backend.shared.storage.SupabaseStorageClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Central policy for portfolio upload limits, MIME types, buckets, and
 * portfolio-scoped object paths.
 */
@Component
@RequiredArgsConstructor
class PortfolioUploadPolicy {

    private static final String RESUME_BUCKET = "private_resumes";
    private static final String ASSET_BUCKET = "portfolio_uploads";
    private static final int MAX_BATCH_FILES = 30;
    private static final long MAX_RESUME_BYTES = 5L * 1024 * 1024;
    private static final long MAX_IMAGE_BYTES = 10L * 1024 * 1024;
    private static final long MAX_VIDEO_BYTES = 50L * 1024 * 1024;

    private static final Map<String, String> RESUME_TYPES = Map.of(
            "pdf", "application/pdf",
            "docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    private static final Map<String, String> IMAGE_TYPES = Map.of(
            "jpg", "image/jpeg",
            "jpeg", "image/jpeg",
            "png", "image/png"
    );
    private static final Map<String, String> VIDEO_TYPES = Map.of(
            "mp3", "audio/mpeg",
            "mp4", "video/mp4",
            "mov", "video/quicktime"
    );

    private final SupabaseStorageClient storageClient;

    /** Validates the complete presign batch and normalizes its file metadata. */
    List<NormalizedUpload> validatePresignBatch(List<PortfolioUploadDescriptorDTO> files) {
        if (files == null || files.isEmpty()) {
            throw badRequest("At least one upload file is required");
        }
        if (files.size() > MAX_BATCH_FILES) {
            throw badRequest("Too many files in one upload batch");
        }

        Set<String> clientIds = new HashSet<>();
        int resumeCount = 0;
        List<NormalizedUpload> normalized = new ArrayList<>();
        for (PortfolioUploadDescriptorDTO file : files) {
            NormalizedUpload upload = normalizeDescriptor(file, clientIds);
            if (upload.kind() == PortfolioUploadKind.RESUME) {
                resumeCount += 1;
            }
            normalized.add(upload);
        }
        if (resumeCount > 1) {
            throw badRequest("Only one resume can be uploaded at a time");
        }
        return List.copyOf(normalized);
    }

    /** Enforces the maximum number of public assets finalized in one request. */
    void validateAssetBatch(List<PortfolioUploadedAssetDTO> assets) {
        if (assets.size() > MAX_BATCH_FILES) {
            throw badRequest("Too many assets in one upload batch");
        }
    }

    ValidatedObject validateResumeObject(UUID portfolioId, String bucket, String path) {
        if (!RESUME_BUCKET.equals(bucket)) {
            throw badRequest("Resume storage bucket is invalid");
        }
        return validateObject(
                bucket,
                path,
                "resumes/" + portfolioId + "/",
                PortfolioUploadKind.RESUME
        );
    }

    ValidatedObject validateAssetObject(UUID portfolioId, PortfolioUploadedAssetDTO asset) {
        if (asset == null || asset.getKind() == null) {
            throw badRequest("Asset kind is required");
        }
        if (asset.getKind() == PortfolioUploadKind.RESUME) {
            throw badRequest("Resume files cannot be finalized as public assets");
        }
        if (!ASSET_BUCKET.equals(asset.getStorageBucket())) {
            throw badRequest("Asset storage bucket is invalid");
        }
        String prefix = asset.getKind() == PortfolioUploadKind.IMAGE
                ? "media/" + portfolioId + "/"
                : "videos/" + portfolioId + "/";
        return validateObject(
                asset.getStorageBucket(),
                asset.getStoragePath(),
                prefix,
                asset.getKind()
        );
    }

    String buildObjectPath(UUID portfolioId, PortfolioUploadKind kind, String extension) {
        String prefix = switch (kind) {
            case RESUME -> "resumes/";
            case IMAGE -> "media/";
            case VIDEO -> "videos/";
        };
        return prefix + portfolioId + "/" + UUID.randomUUID() + "." + extension;
    }

    String bucketFor(PortfolioUploadKind kind) {
        return kind == PortfolioUploadKind.RESUME ? RESUME_BUCKET : ASSET_BUCKET;
    }

    long maxResumeBytes() {
        return MAX_RESUME_BYTES;
    }

    private ValidatedObject validateObject(
            String bucket,
            String path,
            String requiredPrefix,
            PortfolioUploadKind kind
    ) {
        String normalizedPath = trimToNull(path);
        if (normalizedPath == null || !normalizedPath.startsWith(requiredPrefix)) {
            throw badRequest("Storage object path is outside the portfolio upload scope");
        }
        String extension = extensionOf(normalizedPath);
        String expectedContentType = allowedTypes(kind).get(extension);
        if (expectedContentType == null) {
            throw badRequest("Storage object file type is not supported");
        }

        SupabaseStorageClient.ObjectInfo info = storageClient
                .getObjectInfo(bucket, normalizedPath)
                .orElseThrow(() -> badRequest("Uploaded object was not found"));
        if (info.sizeBytes() <= 0 || info.sizeBytes() > maxBytes(kind)) {
            throw badRequest("Uploaded object exceeds the allowed size");
        }
        if (!contentTypeMatches(expectedContentType, info.contentType())) {
            throw badRequest("Uploaded object content type does not match its file name");
        }
        return new ValidatedObject(bucket, normalizedPath, expectedContentType);
    }

    private NormalizedUpload normalizeDescriptor(
            PortfolioUploadDescriptorDTO file,
            Set<String> clientIds
    ) {
        if (file == null || file.getKind() == null) {
            throw badRequest("Every upload requires a file kind");
        }
        String clientId = trimToNull(file.getClientId());
        if (clientId == null || clientId.length() > 100 || !clientIds.add(clientId)) {
            throw badRequest("Every upload requires a unique clientId");
        }
        String extension = extensionOf(file.getOriginalFileName());
        String expectedContentType = allowedTypes(file.getKind()).get(extension);
        if (expectedContentType == null) {
            throw badRequest("Unsupported " + file.getKind().value() + " file type");
        }
        if (file.getFileSizeBytes() <= 0 || file.getFileSizeBytes() > maxBytes(file.getKind())) {
            throw badRequest("Selected file exceeds the allowed size");
        }
        if (!contentTypeMatches(expectedContentType, file.getContentType())) {
            throw badRequest("Selected file content type does not match its file name");
        }
        return new NormalizedUpload(
                clientId,
                file.getKind(),
                extension,
                expectedContentType
        );
    }

    private Map<String, String> allowedTypes(PortfolioUploadKind kind) {
        return switch (kind) {
            case RESUME -> RESUME_TYPES;
            case IMAGE -> IMAGE_TYPES;
            case VIDEO -> VIDEO_TYPES;
        };
    }

    private long maxBytes(PortfolioUploadKind kind) {
        return switch (kind) {
            case RESUME -> MAX_RESUME_BYTES;
            case IMAGE -> MAX_IMAGE_BYTES;
            case VIDEO -> MAX_VIDEO_BYTES;
        };
    }

    private String extensionOf(String fileName) {
        String normalized = trimToNull(fileName);
        int separator = normalized == null ? -1 : normalized.lastIndexOf('.');
        if (separator < 0 || separator == normalized.length() - 1) {
            return "";
        }
        return normalized.substring(separator + 1).toLowerCase(Locale.ROOT);
    }

    private boolean contentTypeMatches(String expected, String actual) {
        String normalized = trimToNull(actual);
        return normalized == null
                || "application/octet-stream".equalsIgnoreCase(normalized)
                || expected.equalsIgnoreCase(normalized);
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    record NormalizedUpload(
            String clientId,
            PortfolioUploadKind kind,
            String extension,
            String contentType
    ) {
    }

    record ValidatedObject(String bucket, String path, String contentType) {
    }
}
