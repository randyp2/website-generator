package com.webgen.webgen_backend.portfolio_service.pub;

import com.webgen.webgen_backend.dto.portfolio.pub.PublicPortfolioDTO;

import java.util.Optional;

public interface PublicPortfolioService {
    Optional<PublicPortfolioDTO> getBySlug(String slug);
}
