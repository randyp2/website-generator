package com.webgen.webgen_backend.verification.service.ai;

import com.webgen.webgen_backend.resume.service.utils.PdfTextExtractor;
import com.webgen.webgen_backend.verification.entity.ClaimEvidenceUpload;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AssetContentExtractorService {

    private static final Logger log = LoggerFactory.getLogger(AssetContentExtractorService.class);

    private static final int MAX_TEXT_BYTES = 250_000;
    private static final int MAX_TEXT_CHARS = 6_000;
    private static final int MAX_PDF_BYTES = 5_000_000;
    private static final int MAX_PDF_CHARS = 6_000;
    private static final int MAX_IMAGE_BYTES = 8_000_000;

    private final ObjectProvider<S3Client> s3ClientProvider;
    private final PdfTextExtractor pdfTextExtractor;

    /**
     * Returns prompt-safe extracted content for supported asset families.
     * Fails soft by returning empty text when extraction is not possible.
     */
    public String extractPromptText(
            ClaimEvidenceUpload upload,
            AssetVerificationPromptBuilder.AssetFamily assetFamily
    ) {
        if (upload == null || assetFamily == null) {
            return "";
        }

        S3Client s3Client = s3ClientProvider.getIfAvailable();
        if (s3Client == null) {
            return "";
        }

        return switch (assetFamily) {
            case TEXT -> extractTextAsset(upload, s3Client);
            case DOCUMENT -> extractDocumentAsset(upload, s3Client);
            case IMAGE, GENERIC -> "";
        };
    }

    /**
     * Returns raw image bytes for multimodal prompting when asset family is IMAGE.
     * Returns null when no image bytes are available or extraction should fail soft.
     */
    public byte[] extractPromptImageBytes(
            ClaimEvidenceUpload upload,
            AssetVerificationPromptBuilder.AssetFamily assetFamily
    ) {
        if (upload == null || assetFamily != AssetVerificationPromptBuilder.AssetFamily.IMAGE) {
            return null;
        }

        S3Client s3Client = s3ClientProvider.getIfAvailable();
        if (s3Client == null) {
            return null;
        }

        Long size = upload.getFileSizeBytes();
        if (size != null && size > MAX_IMAGE_BYTES) {
            return null;
        }

        try {
            byte[] bytes = readObjectBytes(upload, s3Client, MAX_IMAGE_BYTES);
            return bytes.length == 0 ? null : bytes;
        } catch (Exception e) {
            log.warn("Failed to extract image bytes for upload {}: {}", upload.getId(), e.getMessage());
            return null;
        }
    }

    private String extractTextAsset(ClaimEvidenceUpload upload, S3Client s3Client) {
        Long size = upload.getFileSizeBytes();
        if (size != null && size > MAX_TEXT_BYTES) {
            return "";
        }

        try {
            byte[] bytes = readObjectBytes(upload, s3Client, MAX_TEXT_BYTES);
            String raw = new String(bytes, StandardCharsets.UTF_8);
            return truncate(normalizeText(raw), MAX_TEXT_CHARS);
        } catch (Exception e) {
            log.warn("Failed to extract text asset content for upload {}: {}", upload.getId(), e.getMessage());
            return "";
        }
    }

    private String extractDocumentAsset(ClaimEvidenceUpload upload, S3Client s3Client) {
        if (!isPdf(upload.getContentType(), upload.getOriginalFileName())) {
            return "";
        }

        Long size = upload.getFileSizeBytes();
        if (size != null && size > MAX_PDF_BYTES) {
            return "";
        }

        try {
            byte[] bytes = readObjectBytes(upload, s3Client, MAX_PDF_BYTES);
            String raw = pdfTextExtractor.extract(bytes);
            return truncate(normalizeText(raw), MAX_PDF_CHARS);
        } catch (Exception e) {
            log.warn("Failed to extract pdf content for upload {}: {}", upload.getId(), e.getMessage());
            return "";
        }
    }

    private byte[] readObjectBytes(
            ClaimEvidenceUpload upload,
            S3Client s3Client,
            int maxBytes
    ) {
        try (ResponseInputStream<GetObjectResponse> objectStream = s3Client.getObject(
                GetObjectRequest.builder()
                        .bucket(upload.getStorageBucket())
                        .key(upload.getStorageKey())
                        .build()
        )) {
            return objectStream.readNBytes(maxBytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to read object from storage", e);
        }
    }

    private boolean isPdf(String contentType, String originalFileName) {
        String normalizedContentType = contentType == null ? "" : contentType.trim().toLowerCase(Locale.ROOT);
        if (normalizedContentType.contains("pdf")) {
            return true;
        }

        if (originalFileName == null || originalFileName.isBlank()) {
            return false;
        }

        String normalizedFileName = originalFileName.trim().toLowerCase(Locale.ROOT);
        return normalizedFileName.endsWith(".pdf");
    }

    private String normalizeText(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }
        return text
                .replaceAll("\\p{Cntrl}", " ")
                .replaceAll("\\s+", " ")
                .trim();
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
