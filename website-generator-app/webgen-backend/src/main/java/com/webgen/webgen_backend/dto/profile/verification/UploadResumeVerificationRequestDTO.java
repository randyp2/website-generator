package com.webgen.webgen_backend.dto.profile.verification;

import lombok.Data;

@Data
public class UploadResumeVerificationRequestDTO {
    private String rawFileUrl;
    private String originalFileName;
    private String contentType;
    private Long fileSizeBytes;
}
