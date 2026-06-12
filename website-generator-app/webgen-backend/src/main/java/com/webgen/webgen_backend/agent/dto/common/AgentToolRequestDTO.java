package com.webgen.webgen_backend.agent.dto.common;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AgentToolRequestDTO {

    @JsonProperty("tool_name")
    private AgentToolName toolName;

    private String rationale;

    private Map<String, Object> arguments;
}
