package com.webgen.webgen_backend.portfolio.dto.builder;

import com.webgen.webgen_backend.portfolio.dto.common.AssetDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.SectionContentDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.SectionPlanDTO;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class BuilderRequestDTO {
    private UUID portfolioId;
    private String sessionId;
    private List<SectionContentDTO> sections;
    private List<SectionPlanDTO> sectionPlans;
    private List<AssetDTO> assets;
}
