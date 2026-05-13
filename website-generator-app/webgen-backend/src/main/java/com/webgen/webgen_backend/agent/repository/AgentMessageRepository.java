package com.webgen.webgen_backend.agent.repository;

import com.webgen.webgen_backend.agent.entity.AgentMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AgentMessageRepository extends JpaRepository<AgentMessage, UUID> {

    List<AgentMessage> findBySessionIdOrderBySequenceNoAsc(UUID sessionId);

    Optional<AgentMessage> findTopBySessionIdOrderBySequenceNoDesc(UUID sessionId);

    Optional<AgentMessage> findByIdAndSessionId(UUID id, UUID sessionId);

    @Query("""
        SELECT COALESCE(MAX(m.sequenceNo), 0) + 1
        FROM AgentMessage m
        WHERE m.sessionId = :sessionId
    """)
    long nextSequenceNo(@Param("sessionId") UUID sessionId);
}
