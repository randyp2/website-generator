package com.webgen.webgen_backend.portfolio.dto.planner;

import com.webgen.webgen_backend.portfolio.dto.common.AssetDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Plan request for the refine pipeline. Carries only session metadata:
 * section content is loaded server-side from the DB so plans are always made
 * against the portfolio's real current state, never a stale client snapshot.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlannerRequestDTO {
    private UUID portfolioId;
    private String sessionId;
    private List<AssetDTO> assets;
}
