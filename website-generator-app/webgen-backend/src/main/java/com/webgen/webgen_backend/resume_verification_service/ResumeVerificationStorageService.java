package com.webgen.webgen_backend.resume_verification_service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.InvalidMediaTypeException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class ResumeVerificationStorageService {

    private static final String BUCKET = "portfolio_uploads";
    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024L * 1024L;
    private static final String PDF_CONTENT_TYPE = "application/pdf";
    private static final String DOC_CONTENT_TYPE = "application/msword";
    private static final String DOCX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "doc", "docx");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            PDF_CONTENT_TYPE,
            DOC_CONTENT_TYPE,
            DOCX_CONTENT_TYPE,
            MediaType.APPLICATION_OCTET_STREAM_VALUE
    );

    @Value("${supabase.project.url}")
    private String supabaseUrl;

    @Value("${supabase.service-role-key}")
    private String serviceRoleKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public UploadResult uploadResume(UUID profileId, MultipartFile file) {
        validateFile(file);

        String extension = extractExtension(file.getOriginalFilename());
        String storagePath = "resume-verifications/" + profileId + "/" + UUID.randomUUID() + "." + extension;
        String uploadUrl = supabaseUrl + "/storage/v1/object/" + BUCKET + "/" + storagePath;

        MediaType mediaType = resolveMediaType(file.getContentType(), extension);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceRoleKey);
        headers.set("apikey", serviceRoleKey);
        headers.setContentType(mediaType);
        headers.set("x-upsert", "true");

        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to read uploaded file",
                    e
            );
        }

        HttpEntity<byte[]> request = new HttpEntity<>(fileBytes, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(uploadUrl, HttpMethod.POST, request, String.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Failed to upload resume to storage"
                );
            }
        } catch (RestClientException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Failed to upload resume to storage",
                    e
            );
        }

        String publicUrl = supabaseUrl + "/storage/v1/object/public/" + BUCKET + "/" + storagePath;
        String contentType = mediaType.toString();
        String originalFileName = normalizeOriginalFileName(file.getOriginalFilename(), extension);

        return new UploadResult(publicUrl, originalFileName, contentType, file.getSize());
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A resume file is required");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Resume exceeds 5MB limit");
        }

        String extension = extractExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF, DOC, and DOCX files are allowed");
        }

        String contentType = file.getContentType();
        if (StringUtils.hasText(contentType) && !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported resume content type");
        }
    }

    private MediaType resolveMediaType(String contentType, String extension) {
        if (StringUtils.hasText(contentType) && ALLOWED_CONTENT_TYPES.contains(contentType)) {
            try {
                return MediaType.parseMediaType(contentType);
            } catch (InvalidMediaTypeException ignored) {
                // Fall back to extension mapping below.
            }
        }

        return switch (extension) {
            case "pdf" -> MediaType.parseMediaType(PDF_CONTENT_TYPE);
            case "docx" -> MediaType.parseMediaType(DOCX_CONTENT_TYPE);
            default -> MediaType.parseMediaType(DOC_CONTENT_TYPE);
        };
    }

    private String extractExtension(String fileName) {
        if (!StringUtils.hasText(fileName) || !fileName.contains(".")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File name must include an extension");
        }

        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        if (!StringUtils.hasText(extension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file extension");
        }
        return extension;
    }

    private String normalizeOriginalFileName(String fileName, String extension) {
        if (StringUtils.hasText(fileName)) {
            return fileName;
        }
        return "resume." + extension;
    }

    public record UploadResult(
            String publicUrl,
            String originalFileName,
            String contentType,
            long fileSizeBytes
    ) {
    }
}
