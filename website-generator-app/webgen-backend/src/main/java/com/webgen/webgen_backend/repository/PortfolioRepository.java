package com.webgen.webgen_backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.webgen.webgen_backend.entity.Portfolio;

public interface PortfolioRepository extends JpaRepository<Portfolio, UUID> {
    List<Portfolio> findByUserId(UUID userId);
    Optional<Portfolio> findBySlugAndStatus(String slug, String status);
    boolean existsBySlug(String slug);
}
