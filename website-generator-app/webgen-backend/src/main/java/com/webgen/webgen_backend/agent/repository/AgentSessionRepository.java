package com.webgen.webgen_backend.agent.repository;

import com.webgen.webgen_backend.agent.entity.AgentSession;
import com.webgen.webgen_backend.agent.entity.AgentSessionStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AgentSessionRepository extends JpaRepository<AgentSession, UUID> {

    Optional<AgentSession> findByIdAndUserId(UUID id, UUID userId);

    Optional<AgentSession> findByPortfolioIdAndStatus(UUID portfolioId, AgentSessionStatus status);

    List<AgentSession> findByUserIdOrderByLastActivityAtDesc(UUID userId);

    boolean existsByPortfolioIdAndStatus(UUID portfolioId, AgentSessionStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT s
        FROM AgentSession s
        WHERE s.id = :id
    """)
    Optional<AgentSession> findByIdForUpdate(@Param("id") UUID id);
}
