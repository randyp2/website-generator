package com.webgen.webgen_backend.portfolio.repository;

import com.webgen.webgen_backend.portfolio.entity.PortfolioLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface PortfolioLikeRepository extends JpaRepository<PortfolioLike, UUID> {
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            insert into public.portfolio_likes (id, portfolio_id, profile_id)
            values (:id, :portfolioId, :profileId)
            on conflict (portfolio_id, profile_id) do nothing
            """, nativeQuery = true)
    int insertIgnore(UUID id, UUID portfolioId, UUID profileId);

    boolean existsByPortfolio_IdAndProfile_Id(UUID portfolioId, UUID profileId);
    Optional<PortfolioLike> findByPortfolio_IdAndProfile_Id(UUID portfolioId, UUID profileId);
    long countByPortfolio_Id(UUID portfolioId);
}
