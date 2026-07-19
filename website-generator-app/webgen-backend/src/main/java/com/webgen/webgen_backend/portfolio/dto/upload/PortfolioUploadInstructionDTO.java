package com.webgen.webgen_backend.portfolio.dto.upload;

import lombok.Builder;
import lombok.Data;

/** Signed upload coordinates for one validated file descriptor. */
@Data
@Builder
public class PortfolioUploadInstructionDTO {
    private String clientId;
    private PortfolioUploadKind kind;
    private String bucket;
    private String path;
    private String token;
    private String contentType;
}
