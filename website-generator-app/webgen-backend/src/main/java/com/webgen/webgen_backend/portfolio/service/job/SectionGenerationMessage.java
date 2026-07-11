package com.webgen.webgen_backend.portfolio.service.job;


import com.webgen.webgen_backend.portfolio.dto.common.AssetDTO;
import com.webgen.webgen_backend.portfolio.dto.BlueprintDTO;
import com.webgen.webgen_backend.portfolio.dto.BlueprintSectionPlanDTO;
import com.webgen.webgen_backend.portfolio.dto.PortfolioGenerateRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.SectionContentDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.SectionPlanDTO;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierContext;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


/**
 * - Message model for per section generation
 * - Used for the section generation queue
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SectionGenerationMessage {


    /**
     * Utilize same queue for one-shot generation portfolios & refine portfolios
     * Why? -> Both modes share identical infrastructure related to queues:
     *  - Same retry logic
     *  - Same DLQ handling
     *  - Same job tracking via Redis
     *
     *  Main differences:
     *   - LLM Calls
     *   - Persistence paths
     *
     *   !Not a queue layer concern but service layer concern
     */
    public enum Mode {
        GENERATE, // One-shot portfolio generation
        REFINE // Refine portfolio flow
    };

    
    // --- SHARED FIELDS ---
    private String jobId;
    private String portfolioId;
    private String userId;
    private int totalSections;

    // Default to generation mode if there are left over jobs in the queue during deployment
    // Enables backward compatibility
    private Mode mode = Mode.GENERATE;

    // --- GENERATE MODE FIELDS ---
    private PortfolioGenerateRequestDTO req;
    private String refinedPrompt;
    private BlueprintDTO blueprint;
    private BlueprintSectionPlanDTO planItem;

    // --- REFINE MODE FIELDS ---
    private SectionPlanDTO refinePlan;
    private SectionContentDTO existingSection;
    private ClarifierContext clarifierContext;
    private List<AssetDTO> assets;
    private Long refineBuildStartedAtMillis;

}
