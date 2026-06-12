package com.webgen.webgen_backend.agent.dto;

import com.webgen.webgen_backend.agent.dto.common.AgentToolCallStatus;
import com.webgen.webgen_backend.agent.dto.common.AgentToolName;
import com.webgen.webgen_backend.agent.tools.AgentToolExecutionResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentToolCallDTO {
    private AgentToolName toolName;
    private String toolType;
    private AgentToolCallStatus status;
    private String rationale;
    private Map<String, Object> inputJson;
    private Map<String, Object> outputJson;
    private String errorMessage;
    private boolean feedsSynthesis;

    public static AgentToolCallDTO fromExecutionResult(AgentToolExecutionResult result) {
        return AgentToolCallDTO.builder()
                .toolName(result.getToolName())
                .toolType(result.getToolType())
                .status(result.getStatus())
                .rationale(result.getRationale())
                .inputJson(result.getInputJson())
                .outputJson(result.getOutputJson())
                .errorMessage(result.getErrorMessage())
                .feedsSynthesis(result.isFeedsSynthesis())
                .build();
    }
}
