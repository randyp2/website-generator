package com.webgen.webgen_backend.portfolio.service.pub;

import com.webgen.webgen_backend.portfolio.dto.pub.PublicPortfolioCardDTO;
import com.webgen.webgen_backend.portfolio.dto.pub.PublicPortfolioDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface PublicPortfolioService {

    /**
     * Fetches a published portfolio by its slug.
     *
     * @param slug public slug assigned at publish time
     * @return the portfolio if found and published; empty otherwise
     */
    Optional<PublicPortfolioDTO> getBySlug(String slug);

    /**
     * Returns the fully rendered static HTML for a published portfolio.
     * Used by the public portfolio page to serve the pre-rendered output.
     *
     * @param slug public slug assigned at publish time
     * @return rendered HTML string if found; empty otherwise
     */
    Optional<String> getHtmlBySlug(String slug);

    /**
     * Returns a paginated list of all published portfolios for the explore feed.
     *
     * @param pageable pagination and sorting parameters
     * @return page of published portfolio card summaries
     */
    Page<PublicPortfolioCardDTO> listPublished(Pageable pageable);
}
