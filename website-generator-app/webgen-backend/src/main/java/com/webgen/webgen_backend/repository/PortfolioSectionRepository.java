package com.webgen.webgen_backend.repository;

import com.webgen.webgen_backend.entity.PortfolioSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PortfolioSectionRepository extends JpaRepository<PortfolioSection, UUID> {
    Optional<PortfolioSection> findByPortfolioIdAndSectionKey(UUID portfolioId, String sectionKey);
    List<PortfolioSection> findAllByPortfolioIdOrderByOrderIndexAsc(UUID portfolioId);
}
