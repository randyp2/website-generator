package com.webgen.webgen_backend.agent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentChatTurnResponseDTO {
    private UUID sessionId;
    private UUID runId;
    private AgentMessageDTO assistantMessage;
    private AgentStructuredPlanDTO structuredResponse;
    private List<AgentToolCallDTO> toolCalls;
}
