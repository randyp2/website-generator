package com.webgen.webgen_backend.portfolio_service;

import com.webgen.webgen_backend.dto.portfolio.PortfolioGenerateRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.PortfolioGenerateResponseDTO;
import com.webgen.webgen_backend.dto.portfolio.SectionRefineRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.SectionRefineResponseDTO;

public interface PortfolioAiService {

    /**
     *  Given request generate a whole portfolio "one shot" the design
     * @param req - Contains user prompt and context for the portfolio
     * @return PortfolioGenerateResponseDTO -  dto consisting of model response
     */
    PortfolioGenerateResponseDTO generatePortfolio(PortfolioGenerateRequestDTO req);

    /**
     *  Given request generate/refine a section
     * @param req - Contains user prompt and context for the section of the portfolio
     * @return PortfolioGenerateResponseDTO -  dto consisting of model response
     */
    SectionRefineResponseDTO refineSection(SectionRefineRequestDTO req);
}
