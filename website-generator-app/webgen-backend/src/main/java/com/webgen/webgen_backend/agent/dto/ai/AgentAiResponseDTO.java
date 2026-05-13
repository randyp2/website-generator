package com.webgen.webgen_backend.agent.dto.ai;

import com.google.auto.value.AutoValue.Builder;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import org.springframework.ai.chat.model.ChatResponse;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentAiResponseDTO {
    String assistedText; // UI response
    List<ToolCallDTO> toolCalls;
    String model;
    Integer inputTokens;
    Integer outputTokens;
    ChatResponse rawResponse; // Keep for debugging

    // DTO for the tools used
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ToolCallDTO {
        private String toolCallId;
        private String type; // "function", "db look up"
        private String toolName; // "style chat planner"
        private String arguementsJson; // arg needed for tool
    }

}
