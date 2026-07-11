package com.webgen.webgen_backend.portfolio.dto.crud;

import com.fasterxml.jackson.databind.JsonNode;
import com.webgen.webgen_backend.portfolio.dto.common.SectionDTO;
import com.webgen.webgen_backend.portfolio.entity.RefineChatMessage;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class PortfolioLoadResponseDTO {
    private String portfolioId;
    private String templateId;
    private String title;
    private String status;
    /** Version currently in the editor (live sections match it). */
    private UUID activeVersionId;
    /** Version pinned to the public site; null when never pinned. */
    private UUID publishedVersionId;
    private List<SectionDTO> sections;
    private JsonNode globalTheme;
    private JsonNode assistantMessage;
    private List<RefineChatMessage> refineChatHistory;
}
