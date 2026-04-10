package com.webgen.webgen_backend.dto.profile.verification;

import lombok.Data;

@Data
public class UploadResumeVerificationRequestDTO {
    private String rawFileUrl;
    private String rawFileBucket;
    private String rawFilePath;
    private String originalFileName;
    private String contentType;
    private Long fileSizeBytes;
}
