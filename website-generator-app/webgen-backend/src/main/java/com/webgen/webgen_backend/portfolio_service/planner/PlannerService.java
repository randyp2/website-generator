package com.webgen.webgen_backend.portfolio_service.planner;

import com.webgen.webgen_backend.dto.portfolio.planner.PlannerRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.planner.PlannerResponseDTO;

public interface PlannerService {
    PlannerResponseDTO plan(PlannerRequestDTO req);
}
