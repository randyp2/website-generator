package com.webgen.webgen_backend.agent.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.webgen.webgen_backend.agent.entity.AgentToolRunStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentToolRunDTO {
    private UUID id;
    private UUID sessionId;
    private UUID agentRunId;
    private String toolName;
    private AgentToolRunStatus status;
    private JsonNode argsJson;
    private JsonNode resultJson;
    private String errorCode;
    private String errorMessage;
    private String idempotencyKey;
    private OffsetDateTime startedAt;
    private OffsetDateTime finishedAt;
    private Long durationMs;
}
