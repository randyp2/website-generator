package com.webgen.webgen_backend.portfolio_service.crud;

import com.webgen.webgen_backend.dto.portfolio.ResumeDTO;
import com.webgen.webgen_backend.dto.portfolio.crud.*;

import java.util.UUID;

public interface PortfolioCrudService {

    /**
     * Return a list of PortfolioDTO given userId (extracted in JWT)
     * 
     * @param userId - Contains UUID of user
     * @return PortfolioListDTO - List of the user's portfolios
     */
    PortfolioListDTO listPortfolios(UUID userId);

    /**
     * Fetch a single portfolio with its resume and assets
     * 
     * @param userId      - UUID of the authenticated user (for ownership check)
     * @param portfolioId - UUID of the portfolio to fetch
     * @return PortfolioDetailDTO - The portfolio with resume and assets
     */
    PortfolioDetailDTO getPortfolio(UUID userId, UUID portfolioId);

    /**
     * Create a new draft portfolio for the user
     * 
     * @param userId  - UUID of the authenticated user
     * @param request - Contains templateId from client
     * @return PortfolioDTO - The newly created draft portfolio
     */
    PortfolioDTO createDraft(UUID userId, CreatePortfolioRequestDTO request);

    /**
     * Partially update a portfolio's fields
     * 
     * @param userId      - UUID of the authenticated user (for ownership check)
     * @param portfolioId - UUID of the portfolio to update
     * @param request     - Fields to update (null fields are ignored)
     * @return PortfolioDTO - The updated portfolio
     */
    PortfolioDTO updatePortfolio(UUID userId, UUID portfolioId, UpdatePortfolioRequestDTO request);

    void deletePortfolio(UUID userId, UUID portfolioId);

    /**
     * Save storage upload results (resume + assets) to the DB and optionally update
     * portfolio fields
     * 
     * @param userId      - UUID of the authenticated user (for ownership check)
     * @param portfolioId - UUID of the portfolio to attach uploads to
     * @param req         - Storage URLs and metadata forwarded from Next.js
     * @return UploadPortfolioResponseDTO - Updated portfolio, saved resume, and
     *         count of assets
     */
    UploadPortfolioResponseDTO saveUploads(UUID userId, UUID portfolioId, UploadPortfolioRequestDTO req);

    /**
     * Upsert and save resume info
     *
     * @param userId     - UUID of the authenticated user (for ownership check)
     * @param portflioId - UUID of portfolio
     * @param req        - Parsed json and extracted raw, normalized text
     */
    ResumeDTO updateResume(UUID userId, UUID portfolioId, UpdateResumeRequestDTO req);

    /**
     * Fetch the resume for a portfolio
     *
     * @param userId      - UUID of the authenticated user (for ownership check)
     * @param portfolioId - UUID of the portfolio
     * @return ResumeDTO - The resume data
     */
    ResumeDTO getResume(UUID userId, UUID portfolioId);

    /**
     * Load a portfolio's sections and theme data for the refine page
     *
     * @param userId      - UUID of the authenticated user (for ownership check)
     * @param portfolioId - UUID of the portfolio to load
     * @return PortfolioLoadResponseDTO - sections, globalTheme, assistantMessage, templateId
     */
    PortfolioLoadResponseDTO loadPortfolio(UUID userId, UUID portfolioId);

    /**
     * List all generated versions for a portfolio
     *
     * @param userId      - UUID of the authenticated user (for ownership check)
     * @param portfolioId - UUID of the portfolio
     * @return VersionListResponseDTO - list of versions with isActive flag
     */
    VersionListResponseDTO listVersions(UUID userId, UUID portfolioId);

    /**
     * Activate a specific version, updating the portfolio's active_version_id
     *
     * @param userId      - UUID of the authenticated user (for ownership check)
     * @param portfolioId - UUID of the portfolio
     * @param versionId   - UUID of the version to activate
     * @return ActivateVersionResponseDTO - portfolioId and new activeVersionId
     */
    ActivateVersionResponseDTO activateVersion(UUID userId, UUID portfolioId, UUID versionId);

    /**
     * Verify that the authenticated user owns the given portfolio.
     * Throws ResponseStatusException(FORBIDDEN) if not, or NOT_FOUND if portfolio doesn't exist.
     *
     * @param userId      - UUID of the authenticated user
     * @param portfolioId - UUID of the portfolio to check
     */
    void verifyOwnership(UUID userId, UUID portfolioId);

    /**
     * Publish a portfolio: assign a slug and set status to 'publish'
     *
     * @param userId      - UUID of the authenticated user (for ownership check)
     * @param portfolioId - UUID of the portfolio to publish
     * @param request     - Optional slug (auto-generated if null)
     * @return PublishResponseDTO - The assigned slug and new status
     */
    PublishResponseDTO publishPortfolio(UUID userId, UUID portfolioId, PublishRequestDTO request);

    /**
     * Unpublish a portfolio: set status back to 'draft', retain slug
     *
     * @param userId      - UUID of the authenticated user (for ownership check)
     * @param portfolioId - UUID of the portfolio to unpublish
     */
    void unpublishPortfolio(UUID userId, UUID portfolioId);
}
