package com.webgen.webgen_backend.dto.portfolio.crud;

import com.webgen.webgen_backend.entity.portfolio.StyleChatMessage;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class PortfolioDTO {
    private UUID id;
    private String title;
    private String status;
    private String templateId;
    private String lastStep;
    private String slug;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private List<StyleChatMessage> styleChatHistory;
    private String screenshotUrl;
    private String description;
    private String sourceType;
    private String externalUrl;
}
