package com.webgen.webgen_backend.portfolio.repository;

import com.webgen.webgen_backend.portfolio.entity.PortfolioRefinementSession;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

/** Persistence boundary for bounded portfolio refinement workflows. */
public interface PortfolioRefinementSessionRepository
        extends JpaRepository<PortfolioRefinementSession, UUID> {

    /** Locks a refinement session while its workflow state advances. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM PortfolioRefinementSession s WHERE s.id = :id")
    Optional<PortfolioRefinementSession> findByIdForUpdate(@Param("id") UUID id);
}
