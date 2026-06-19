package com.webgen.webgen_backend.portfolio.repository;

import com.webgen.webgen_backend.portfolio.entity.PortfolioLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PortfolioLikeRepository extends JpaRepository<PortfolioLike, UUID> {
    boolean existsByPortfolio_IdAndProfile_Id(UUID portfolioId, UUID profileId);
    Optional<PortfolioLike> findByPortfolio_IdAndProfile_Id(UUID portfolioId, UUID profileId);
    long countByPortfolio_Id(UUID portfolioId);
}
