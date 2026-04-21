package com.webgen.webgen_backend.portfolio.dto.planner;

import com.webgen.webgen_backend.portfolio.dto.common.AssetDTO;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class PlannerRequestDTO {
    private UUID portfolioId;
    private String sessionId;
    private List<SectionPlanInputDTO> sections;
    private List<AssetDTO> assets;
}
