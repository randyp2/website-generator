package com.webgen.webgen_backend.dto.portfolio.planner;

import com.webgen.webgen_backend.model.portfolio.clarifier.ChangeIntensity;
import lombok.Data;
import java.util.List;

@Data
public class SectionPlanDTO {
    private String sectionKey;
    private String action;           // "modify" | "keep" | "reorder" | "add" | "delete"
    private String instruction;      // What to do
    private String rationale;        // Why
    private ChangeIntensity intensity;
    private List<String> preserveElements;
    private String newSectionTitle;
    private String insertAfterSectionKey;
    private Integer orderIndex;
}
