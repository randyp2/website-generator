package com.webgen.webgen_backend.portfolio.repository;

import com.webgen.webgen_backend.portfolio.entity.PortfolioEngagementCounter;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface PortfolioEngagementCounterRepository
        extends JpaRepository<PortfolioEngagementCounter, UUID> {
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update PortfolioEngagementCounter c
            set c.viewsCount = c.viewsCount + 1
            where c.portfolioId = :portfolioId
            """)
    int incrementViewsCount(UUID portfolioId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update PortfolioEngagementCounter c
            set c.sharesCount = c.sharesCount + 1
            where c.portfolioId = :portfolioId
            """)
    int incrementSharesCount(UUID portfolioId);
}
