package com.webgen.webgen_backend.portfolio_service.crud;

import com.webgen.webgen_backend.dto.portfolio.crud.CreatePortfolioRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.crud.PortfolioDTO;
import com.webgen.webgen_backend.dto.portfolio.crud.PortfolioDetailDTO;
import com.webgen.webgen_backend.dto.portfolio.crud.PortfolioListDTO;
import com.webgen.webgen_backend.dto.portfolio.crud.UpdatePortfolioRequestDTO;

import java.util.UUID;

public interface PortfolioCrudService {

    /**
     *  Return a list of PortfolioDTO given userId (extracted in JWT)
     * @param userId - Contains UUID of user
     * @return PortfolioListDTO -  List of the user's portfolios
     */
    PortfolioListDTO listPortfolios(UUID userId);

    /**
     * Fetch a single portfolio with its resume and assets
     * @param userId - UUID of the authenticated user (for ownership check)
     * @param portfolioId - UUID of the portfolio to fetch
     * @return PortfolioDetailDTO - The portfolio with resume and assets
     */
    PortfolioDetailDTO getPortfolio(UUID userId, UUID portfolioId);

    /**
     * Create a new draft portfolio for the user
     * @param userId - UUID of the authenticated user
     * @param request - Contains templateId from client
     * @return PortfolioDTO - The newly created draft portfolio
     */
    PortfolioDTO createDraft(UUID userId, CreatePortfolioRequestDTO request);

    /**
     * Partially update a portfolio's fields
     * @param userId - UUID of the authenticated user (for ownership check)
     * @param portfolioId - UUID of the portfolio to update
     * @param request - Fields to update (null fields are ignored)
     * @return PortfolioDTO - The updated portfolio
     */
    PortfolioDTO updatePortfolio(UUID userId, UUID portfolioId, UpdatePortfolioRequestDTO request);

    void deletePortfolio(UUID userId, UUID portfolioId);
}
