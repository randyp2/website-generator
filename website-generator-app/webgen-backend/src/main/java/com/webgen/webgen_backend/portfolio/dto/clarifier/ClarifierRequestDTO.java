package com.webgen.webgen_backend.portfolio.dto.clarifier;

import com.webgen.webgen_backend.portfolio.dto.common.AssetDTO;
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
