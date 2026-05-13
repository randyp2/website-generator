package com.webgen.webgen_backend.agent.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.webgen.webgen_backend.agent.entity.AgentRunStatus;
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
public class AgentRunDTO {
    private UUID id;
    private UUID sessionId;
    private UUID userMessageId;
    private UUID assistantMessageId;
    private AgentRunStatus status;
    private String model;
    private Integer inputTokens;
    private Integer outputTokens;
    private Integer totalTokens;
    private JsonNode rawRequestJson;
    private JsonNode rawResponseJson;
    private String errorCode;
    private String errorMessage;
    private OffsetDateTime startedAt;
    private OffsetDateTime finishedAt;
    private Long durationMs;
}
