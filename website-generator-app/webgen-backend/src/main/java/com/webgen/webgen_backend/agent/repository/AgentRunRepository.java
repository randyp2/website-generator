package com.webgen.webgen_backend.agent.repository;

import com.webgen.webgen_backend.agent.entity.AgentRun;
import com.webgen.webgen_backend.agent.entity.AgentRunStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AgentRunRepository extends JpaRepository<AgentRun, UUID> {

    Optional<AgentRun> findBySessionIdAndUserMessageId(UUID sessionId, UUID userMessageId);

    Optional<AgentRun> findTopBySessionIdOrderByStartedAtDesc(UUID sessionId);

    Optional<AgentRun> findByIdAndSessionId(UUID id, UUID sessionId);

    List<AgentRun> findBySessionIdOrderByStartedAtDesc(UUID sessionId);

    List<AgentRun> findBySessionIdAndStatusOrderByStartedAtDesc(UUID sessionId, AgentRunStatus status);
}
