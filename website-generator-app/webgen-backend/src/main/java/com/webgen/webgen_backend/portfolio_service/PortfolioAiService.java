package com.webgen.webgen_backend.portfolio_service;

import com.webgen.webgen_backend.dto.portfolio.*;

import java.util.UUID;

public interface PortfolioAiService {

    /**
     *  Given request generate a whole portfolio "one shot" the design
     * @param portfolioId - ID of the portfolio to generate for
     * @param userId - ID of the authenticated user (for ownership check)
     * @param req - Contains user prompt and context for the portfolio
     * @return PortfolioGenerateResponseDTO -  dto consisting of model response
     */
    PortfolioGenerateResponseDTO generatePortfolio(
            UUID portfolioId,
            UUID userId,
            PortfolioGenerateRequestDTO req,
            String jobId
    );

    /**
     * Generate a single section pertaining to a single portfolio
     * @param req - Contains prompt and context for whole portfolio
     * @param refinedPrompt - User refined prompt by LLM
     * @param blueprint - Blueprint plan and style direction of entire portfolio
     * @param planItem - Specific blueprint per section
     * @param jobId - id of job in redis
     */
    void generateSingleSectionFromQueue(
            PortfolioGenerateRequestDTO req,
            String refinedPrompt,
            BlueprintDTO blueprint,
            BlueprintSectionPlanDTO planItem,
            String jobId
    );

    /**
     *  Given request generate/refine a section
     * @param req - Contains user prompt and context for the section of the portfolio
     * @return PortfolioGenerateResponseDTO -  dto consisting of model response
     */
    SectionRefineResponseDTO refineSection(SectionRefineRequestDTO req);
}
