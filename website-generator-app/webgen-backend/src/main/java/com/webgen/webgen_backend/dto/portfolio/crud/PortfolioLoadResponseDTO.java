package com.webgen.webgen_backend.dto.portfolio.crud;

import com.fasterxml.jackson.databind.JsonNode;
import com.webgen.webgen_backend.dto.portfolio.SectionDTO;
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
}
