package com.webgen.webgen_backend.dto.portfolio.planner;

import lombok.Data;
import java.util.List;

@Data
public class PlannerResponseDTO {
    private String planSummary;
    private List<SectionPlanDTO> sectionPlans;
    private boolean planApproved;
}
