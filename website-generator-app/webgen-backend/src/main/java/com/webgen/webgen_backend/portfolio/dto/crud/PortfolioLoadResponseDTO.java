package com.webgen.webgen_backend.portfolio.dto.crud;

import com.fasterxml.jackson.databind.JsonNode;
import com.webgen.webgen_backend.portfolio.dto.common.SectionDTO;
import com.webgen.webgen_backend.portfolio.entity.RefineChatMessage;
import lombok.Data;

import java.util.List;

@Data
public class PortfolioLoadResponseDTO {
    private String portfolioId;
    private String templateId;
    private String title;
    private List<SectionDTO> sections;
    private JsonNode globalTheme;
    private JsonNode assistantMessage;
    private List<RefineChatMessage> refineChatHistory;
}
