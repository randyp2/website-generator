package com.webgen.webgen_backend.portfolio.dto.builder;

import com.webgen.webgen_backend.portfolio.dto.common.AssetDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.SectionPlanDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Build request for the refine pipeline. Carries only plans and metadata:
 * section code is loaded server-side from the DB so a stale client can never
 * overwrite newer persisted sections.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuilderRequestDTO {
    private UUID portfolioId;
    private String sessionId;
    private List<SectionPlanDTO> sectionPlans;
    private List<AssetDTO> assets;
}
