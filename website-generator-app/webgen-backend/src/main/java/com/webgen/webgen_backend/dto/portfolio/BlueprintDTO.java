package com.webgen.webgen_backend.dto.portfolio;

import com.webgen.webgen_backend.dto.portfolio.common.AssistantMessageDTO;
import com.webgen.webgen_backend.dto.portfolio.common.GlobalThemeDTO;
import lombok.Data;

import java.util.List;

@Data
public class BlueprintDTO {

    // --- meta information about global theme
    private GlobalThemeDTO globalThemeDTO;

    // --- Ordered lists of sections to generate
    private List<BlueprintSectionPlanDTO> sectionPlan;

    // --- Design summary
    // Passed to each section for context
    private String designDirective;

    // Summary of plan
    private AssistantMessageDTO assistantMessage;
}
