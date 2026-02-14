package com.webgen.webgen_backend.dto.portfolio.builder;

import com.webgen.webgen_backend.dto.portfolio.AssetDTO;
import com.webgen.webgen_backend.dto.portfolio.planner.SectionContentDTO;
import com.webgen.webgen_backend.dto.portfolio.planner.SectionPlanDTO;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class BuilderRequestDTO {
    private UUID portfolioId;
    private List<SectionContentDTO> sections;
    private List<SectionPlanDTO> sectionPlans;
    private List<AssetDTO> assets;
}
