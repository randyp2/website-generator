package com.webgen.webgen_backend.portfolio_service.job;


import com.webgen.webgen_backend.dto.portfolio.BlueprintDTO;
import com.webgen.webgen_backend.dto.portfolio.BlueprintSectionPlanDTO;
import com.webgen.webgen_backend.dto.portfolio.PortfolioGenerateRequestDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * - Message model for per section generation
 * - Used for the section generation queue
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SectionGenerationMessage {
    private String jobId;
    private String portfolioId;
    private String userId;
    private PortfolioGenerateRequestDTO req;
    private String refinedPrompt;
    private BlueprintDTO blueprint;
    private BlueprintSectionPlanDTO planItem;
    private int totalSections;
}
