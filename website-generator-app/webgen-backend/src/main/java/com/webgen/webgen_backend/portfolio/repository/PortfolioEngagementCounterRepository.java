package com.webgen.webgen_backend.portfolio.repository;

import com.webgen.webgen_backend.portfolio.entity.PortfolioEngagementCounter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PortfolioEngagementCounterRepository
        extends JpaRepository<PortfolioEngagementCounter, UUID> {
}
