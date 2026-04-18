package com.webgen.webgen_backend.verification.dto;

import lombok.Data;

@Data
public class UploadResumeVerificationRequestDTO {
    private String rawFileBucket;
    private String rawFilePath;
    private String originalFileName;
    private String contentType;
    private Long fileSizeBytes;
}
