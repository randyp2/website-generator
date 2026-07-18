package com.webgen.webgen_backend.portfolio.dto.upload;

import lombok.Data;

/** Describes one browser-selected file before any storage permission is issued. */
@Data
public class PortfolioUploadDescriptorDTO {
    private String clientId;
    private PortfolioUploadKind kind;
    private String originalFileName;
    private String contentType;
    private long fileSizeBytes;
}
