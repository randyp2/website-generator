package com.webgen.webgen_backend.portfolio.service.planner;

import com.webgen.webgen_backend.portfolio.dto.planner.PlannerRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.PlannerResponseDTO;

public interface PlannerService {
    PlannerResponseDTO plan(PlannerRequestDTO req);
}
