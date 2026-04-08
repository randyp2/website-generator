package com.webgen.webgen_backend.dto.portfolio.pub;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
public class PublicPortfolioDTO {
    private String portfolioId;
    private String userId;
    private String title;
    private String slug;
    private String templateId;
    private List<PublicSectionDTO> sections;
    private JsonNode globalTheme;
    private String ownerName;
    private String ownerAvatarUrl;
    private OffsetDateTime publishedAt;
    private String screenshotUrl;
    private String description;
    private String sourceType;
    private String externalUrl;
}
