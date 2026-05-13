package com.webgen.webgen_backend.agent.repository;

import com.webgen.webgen_backend.agent.entity.AgentToolRun;
import com.webgen.webgen_backend.agent.entity.AgentToolRunStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AgentToolRunRepository extends JpaRepository<AgentToolRun, UUID> {

    Optional<AgentToolRun> findBySessionIdAndIdempotencyKey(UUID sessionId, String idempotencyKey);

    Optional<AgentToolRun> findByIdAndSessionId(UUID id, UUID sessionId);

    List<AgentToolRun> findByAgentRunIdOrderByStartedAtAsc(UUID agentRunId);

    List<AgentToolRun> findBySessionIdOrderByStartedAtDesc(UUID sessionId);

    List<AgentToolRun> findBySessionIdAndStatusOrderByStartedAtDesc(UUID sessionId, AgentToolRunStatus status);

    boolean existsBySessionIdAndIdempotencyKey(UUID sessionId, String idempotencyKey);
}
