package com.webgen.webgen_backend.portfolio.dto.upload;

import lombok.Data;

/** Storage reference and presentation metadata for one uploaded public asset. */
@Data
public class PortfolioUploadedAssetDTO {
    private PortfolioUploadKind kind;
    private String storageBucket;
    private String storagePath;
    private String label;
    private String title;
    private String description;
    private String alt;
    private String sectionHint;
}
