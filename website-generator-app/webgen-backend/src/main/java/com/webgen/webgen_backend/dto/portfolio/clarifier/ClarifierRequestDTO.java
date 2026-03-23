package com.webgen.webgen_backend.dto.portfolio.clarifier;

import com.webgen.webgen_backend.dto.portfolio.AssetDTO;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ClarifierRequestDTO {
    private UUID portfolioId;
    private String userPrompt;
    private String sessionId;
    private List<SectionSummaryDTO> sections;
    private List<AssetDTO> assets;
}
