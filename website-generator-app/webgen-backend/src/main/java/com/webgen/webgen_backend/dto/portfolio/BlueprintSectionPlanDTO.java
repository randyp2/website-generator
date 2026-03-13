package com.webgen.webgen_backend.dto.portfolio;

import lombok.Data;

@Data
public class BlueprintSectionPlanDTO {
    private String sectionKey; // "navbar", "hero", ...
    private String title;
    private int orderIndex;
    private String layoutHint; // Layout styling for the section
    private String contentStrategy; // Resume data to pull in for this section
}
