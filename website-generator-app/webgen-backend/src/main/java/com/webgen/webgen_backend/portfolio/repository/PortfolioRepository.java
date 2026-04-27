package com.webgen.webgen_backend.portfolio.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.webgen.webgen_backend.portfolio.entity.Portfolio;

public interface PortfolioRepository extends JpaRepository<Portfolio, UUID> {
    List<Portfolio> findByUserId(UUID userId);
    Optional<Portfolio> findBySlugAndStatus(String slug, String status);
    boolean existsBySlug(String slug);
    Page<Portfolio> findByStatusAndSlugIsNotNull(String status, Pageable pageable);
    Page<Portfolio> findByUserIdAndStatusAndSlugIsNotNull(UUID userId, String status, Pageable pageable);
}
