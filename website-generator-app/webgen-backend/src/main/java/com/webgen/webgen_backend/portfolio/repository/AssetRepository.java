package com.webgen.webgen_backend.portfolio.repository;

import com.webgen.webgen_backend.portfolio.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AssetRepository extends JpaRepository<Asset, UUID> {
    List<Asset> findByPortfolioId(UUID portfolioId);

    /** Supports idempotent upload finalization for an already-saved storage object. */
    boolean existsByPortfolio_IdAndFileUrl(UUID portfolioId, String fileUrl);
}
