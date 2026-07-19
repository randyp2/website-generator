package com.webgen.webgen_backend.portfolio.service;

import com.webgen.webgen_backend.portfolio.dto.*;
import com.webgen.webgen_backend.portfolio.dto.common.*;
import com.webgen.webgen_backend.portfolio.service.job.SectionGenerationMessage;

import java.util.UUID;

public interface PortfolioAiService {

    /**
     *  Given request generate a whole portfolio "one shot" the design
     * @param portfolioId - ID of the portfolio to generate for
     * @param userId - ID of the authenticated user (for ownership check)
     * @param req - Contains user prompt and context for the portfolio
     * @param jobId generation job used for status and section fan-out
     * @param creditReservationId credit reservation attached to all queued section work
     */
    void generatePortfolio(
            UUID portfolioId,
            UUID userId,
            PortfolioGenerateRequestDTO req,
            String jobId,
            UUID creditReservationId
    );

    /**
     * Generate a single section pertaining to a single portfolio
     * @param msg - Single sectiongenerationmsg model
     */
    void generateSingleSectionFromQueue(SectionGenerationMessage msg);

    /**
     *  Given request generate/refine a section
     * @param req - Contains user prompt and context for the section of the portfolio
     * @return PortfolioGenerateResponseDTO -  dto consisting of model response
     */
    SectionRefineResponseDTO refineSection(SectionRefineRequestDTO req);
}
