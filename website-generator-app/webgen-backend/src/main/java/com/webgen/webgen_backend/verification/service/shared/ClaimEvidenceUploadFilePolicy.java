package com.webgen.webgen_backend.verification.service.shared;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Component
public class ClaimEvidenceUploadFilePolicy {

    private static final long MB = 1024L * 1024L;
    private static final int MAX_ORIGINAL_FILENAME_LENGTH = 255;

    private static final Map<String, String> ALLOWED_EXTENSION_TO_CONTENT_TYPE = Map.of(
            "pdf", "application/pdf",
            "png", "image/png",
            "jpg", "image/jpeg",
            "jpeg", "image/jpeg",
            "txt", "text/plain"
    );

    private static final Map<String, Long> MAX_BYTES_BY_CONTENT_TYPE = Map.of(
            "application/pdf", 10L * MB,
            "image/png", 5L * MB,
            "image/jpeg", 5L * MB,
            "text/plain", 1L * MB
    );

    private static final Map<String, String> CONTENT_TYPE_ALIASES = Map.of(
            "image/jpg", "image/jpeg"
    );

    public NormalizedUploadMetadata validateAndNormalizeForPresign(
            String originalFileName,
            String rawContentType,
            Long fileSizeBytes
    ) {
        String normalizedOriginalFileName = normalizeOriginalFileName(originalFileName);
        String normalizedContentType = normalizeContentTypeOrThrow(rawContentType);
        validateFilePolicy(normalizedOriginalFileName, normalizedContentType, fileSizeBytes);

        return new NormalizedUploadMetadata(
                normalizedOriginalFileName,
                normalizedContentType,
                fileSizeBytes
        );
    }

    public String normalizeContentType(String rawContentType) {
        if (!StringUtils.hasText(rawContentType)) {
            return null;
        }

        String normalizedContentType = rawContentType.trim().toLowerCase(Locale.ROOT);
        int semicolonIndex = normalizedContentType.indexOf(';');
        if (semicolonIndex >= 0) {
            normalizedContentType = normalizedContentType.substring(0, semicolonIndex).trim();
        }

        if (!StringUtils.hasText(normalizedContentType)) {
            return null;
        }

        return CONTENT_TYPE_ALIASES.getOrDefault(normalizedContentType, normalizedContentType);
    }

    public void assertSupportedContentType(String rawContentType) {
        String normalizedContentType = normalizeContentTypeOrThrow(rawContentType);
        if (!MAX_BYTES_BY_CONTENT_TYPE.containsKey(normalizedContentType)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unsupported file type. Allowed: pdf, png, jpg, jpeg, txt"
            );
        }
    }

    private String normalizeContentTypeOrThrow(String rawContentType) {
        String normalizedContentType = normalizeContentType(rawContentType);
        if (!StringUtils.hasText(normalizedContentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "contentType is invalid");
        }
        return normalizedContentType;
    }

    private String normalizeOriginalFileName(String originalFileName) {
        String value = Optional.ofNullable(originalFileName).orElse("").trim();
        if (!StringUtils.hasText(value)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "originalFileName is required");
        }

        int slashIndex = Math.max(value.lastIndexOf('/'), value.lastIndexOf('\\'));
        if (slashIndex >= 0 && slashIndex < value.length() - 1) {
            value = value.substring(slashIndex + 1);
        }

        if (value.length() > MAX_ORIGINAL_FILENAME_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "originalFileName is too long");
        }

        return value;
    }

    private void validateFilePolicy(
            String originalFileName,
            String normalizedContentType,
            Long fileSizeBytes
    ) {
        String extension = extractFileExtension(originalFileName);
        String expectedContentType = ALLOWED_EXTENSION_TO_CONTENT_TYPE.get(extension);

        if (!StringUtils.hasText(expectedContentType)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unsupported file type. Allowed: pdf, png, jpg, jpeg, txt"
            );
        }

        if (!expectedContentType.equals(normalizedContentType)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "File extension does not match contentType"
            );
        }

        Long maxAllowedSize = MAX_BYTES_BY_CONTENT_TYPE.get(normalizedContentType);
        if (maxAllowedSize == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported contentType");
        }

        if (fileSizeBytes == null || fileSizeBytes <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fileSizeBytes must be > 0");
        }

        if (fileSizeBytes > maxAllowedSize) {
            throw new ResponseStatusException(
                    HttpStatus.PAYLOAD_TOO_LARGE,
                    "File is too large for declared contentType"
            );
        }
    }

    private String extractFileExtension(String originalFileName) {
        int dotIndex = originalFileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == originalFileName.length() - 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "File extension is required"
            );
        }
        return originalFileName.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }

    public record NormalizedUploadMetadata(
            String originalFileName,
            String contentType,
            long fileSizeBytes
    ) {}
}
