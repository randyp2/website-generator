package com.webgen.webgen_backend.agent.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.webgen.webgen_backend.agent.entity.AgentSessionStatus;
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
public class AgentSessionDTO {
    private UUID id;
    private UUID portfolioId;
    private UUID userId;
    private AgentSessionStatus status;
    private JsonNode memoryJson;
    private String currentJobId;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime lastActivityAt;
    private Integer version;
}
