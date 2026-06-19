package com.webgen.webgen_backend.agent.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.webgen.webgen_backend.agent.dto.common.AgentToolRequestDTO;
import com.webgen.webgen_backend.agent.entity.AgentSessionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AgentStructuredPlanDTO {

    @JsonProperty("assistant_message")
    private String assistantMessage;

    @JsonProperty("session_status")
    private AgentSessionStatus sessionStatus;

    @JsonProperty("memory_updates")
    private JsonNode memoryUpdates;

    @JsonProperty("ui_hints")
    private AgentUiHintsDTO uiHints;

    @JsonProperty("tool_requests")
    private List<AgentToolRequestDTO> toolRequests;
}
