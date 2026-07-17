package com.webgen.webgen_backend.portfolio.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.webgen.webgen_backend.portfolio.entity.Portfolio;

public interface PortfolioRepository extends JpaRepository<Portfolio, UUID> {
    List<Portfolio> findByUserId(UUID userId);

    /** Returns only IDs needed to derive account-owned storage prefixes. */
    @Query("SELECT portfolio.id FROM Portfolio portfolio WHERE portfolio.userId = :userId")
    List<UUID> findIdsByUserId(@Param("userId") UUID userId);

    Optional<Portfolio> findByIdAndUserId(UUID id, UUID userId);
    Optional<Portfolio> findBySlugAndStatus(String slug, String status);
    boolean existsBySlug(String slug);
    Page<Portfolio> findByStatusAndSlugIsNotNull(String status, Pageable pageable);
    Page<Portfolio> findByUserIdAndStatusAndSlugIsNotNull(UUID userId, String status, Pageable pageable);
}
