package com.webgen.webgen_backend.dto.portfolio.common;

import lombok.Data;

@Data
public class AssetDTO {
    private String id; // Optional
    private String type;
    private String url;
    private String label;
    private String title;
    private String description;
    private String alt;
    private String sectionHint;

}
