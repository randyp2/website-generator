package com.webgen.webgen_backend.dto.portfolio.planner;

import com.webgen.webgen_backend.dto.portfolio.AssetDTO;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class PlannerRequestDTO {
    private UUID portfolioId;
    private List<SectionContentDTO> sections;
    private List<AssetDTO> assets;
}
