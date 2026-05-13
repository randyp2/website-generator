package com.webgen.webgen_backend.agent.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.webgen.webgen_backend.agent.entity.AgentMessageRole;
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
public class AgentMessageDTO {
    private UUID id;
    private UUID sessionId;
    private Long sequenceNo;
    private AgentMessageRole role;
    private String content;
    private JsonNode contentJson;
    private String toolName;
    private String toolCallId;
    private OffsetDateTime createdAt;
}
