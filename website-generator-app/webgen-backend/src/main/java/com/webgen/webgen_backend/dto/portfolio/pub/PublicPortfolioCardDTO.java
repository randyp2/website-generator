package com.webgen.webgen_backend.dto.portfolio.pub;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class PublicPortfolioCardDTO {
    private String title;
    private String slug;
    private String templateId;
    private String ownerName;
    private String ownerAvatarUrl;
    private OffsetDateTime publishedAt;
    private String screenshotUrl;
    private String description;
    private String sourceType;
    private String externalUrl;
}
