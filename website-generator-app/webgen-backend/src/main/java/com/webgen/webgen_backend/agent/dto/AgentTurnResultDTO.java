package com.webgen.webgen_backend.agent.dto;

import com.webgen.webgen_backend.agent.entity.AgentRunStatus;
import com.webgen.webgen_backend.agent.entity.AgentSessionStage;
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
public class AgentTurnResultDTO {
    private UUID sessionId;
    private UUID runId;
    private UUID userMessageId;
    private UUID assistantMessageId;
    private AgentRunStatus runStatus;
    private AgentSessionStage sessionStage;
    private String assistantMessage;
    private OffsetDateTime completedAt;
}
