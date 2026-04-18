package com.webgen.webgen_backend.portfolio.service.pub;

import com.webgen.webgen_backend.portfolio.dto.pub.PublicPortfolioCardDTO;
import com.webgen.webgen_backend.portfolio.dto.pub.PublicPortfolioDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface PublicPortfolioService {
    Optional<PublicPortfolioDTO> getBySlug(String slug);
    Optional<String> getHtmlBySlug(String slug);
    Page<PublicPortfolioCardDTO> listPublished(Pageable pageable);
}
