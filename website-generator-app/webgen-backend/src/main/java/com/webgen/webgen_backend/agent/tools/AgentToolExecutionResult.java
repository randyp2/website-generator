package com.webgen.webgen_backend.agent.tools;

import com.webgen.webgen_backend.agent.dto.common.AgentToolCallStatus;
import com.webgen.webgen_backend.agent.dto.common.AgentToolName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentToolExecutionResult {
    private AgentToolName toolName;
    private String toolType;
    private AgentToolCallStatus status;
    private String rationale;
    private Map<String, Object> inputJson;
    private Map<String, Object> outputJson;
    private String errorMessage;
    private boolean feedsSynthesis;
}
