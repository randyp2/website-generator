package com.webgen.webgen_backend.agent.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.webgen.webgen_backend.agent.entity.AgentSessionStage;
import com.webgen.webgen_backend.agent.entity.AgentSessionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Internal payload used for the orchestrator
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AgentAssistantPayloadDTO {

    @JsonProperty("assistant_message")
    private String assistantMessage;

    @JsonProperty("session_stage")
    private AgentSessionStage sessionStage;

    @JsonProperty("session_status")
    private AgentSessionStatus sessionStatus;

    @JsonProperty("memory_updates")
    private JsonNode memoryUpdates;

    @JsonProperty("next_action")
    private String nextAction;

    @JsonProperty("next_tool")
    private NextToolDTO nextTool;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class NextToolDTO {
        private String name;
        private JsonNode arguments;
    }
}
