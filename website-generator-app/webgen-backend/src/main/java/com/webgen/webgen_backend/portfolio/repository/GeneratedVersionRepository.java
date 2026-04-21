package com.webgen.webgen_backend.portfolio.repository;

import com.webgen.webgen_backend.portfolio.entity.GeneratedVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GeneratedVersionRepository extends JpaRepository<GeneratedVersion, UUID> {
    List<GeneratedVersion> findByPortfolio_IdOrderByCreatedAtDesc(UUID portfolioId);
    Optional<GeneratedVersion> findByIdAndPortfolio_Id(UUID id, UUID portfolioId);
}
