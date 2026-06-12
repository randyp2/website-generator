package com.webgen.webgen_backend.agent.tools.recordstylepreference;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.agent.dto.common.AgentToolCallStatus;
import com.webgen.webgen_backend.agent.dto.common.AgentToolName;
import com.webgen.webgen_backend.agent.dto.common.AgentToolRequestDTO;
import com.webgen.webgen_backend.agent.dto.tool.recordstylepreference.RecordStylePreferenceToolInputDTO;
import com.webgen.webgen_backend.agent.tools.AgentToolExecutionResult;
import com.webgen.webgen_backend.agent.tools.AgentToolHandler;
import com.webgen.webgen_backend.agent.tools.style.AgentStyleMemoryStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AgentRecordStylePreferenceToolHandler implements AgentToolHandler {

    private static final String TOOL_TYPE = "structured_output";

    private final AgentStyleMemoryStore agentStyleMemoryStore;
    private final ObjectMapper objectMapper;

    @Override
    public Set<AgentToolName> toolNames() {
        return Set.of(AgentToolName.RECORD_STYLE_PREFERENCE);
    }

    @Override
    public AgentToolExecutionResult execute(UUID portfolioId, AgentToolRequestDTO toolRequest) {
        //--- Convert structured tool arguments into the style memory write contract
        Map<String, Object> inputJson = toolRequest.getArguments() == null
                ? Map.of()
                : toolRequest.getArguments();
        RecordStylePreferenceToolInputDTO input = objectMapper.convertValue(
                inputJson,
                RecordStylePreferenceToolInputDTO.class);

        //--- Merge provided style preferences into agent session memory
        Map<String, Object> collected = agentStyleMemoryStore.recordStyle(portfolioId, input);
        boolean isComplete = agentStyleMemoryStore.isComplete(collected);

        Map<String, Object> outputJson = new LinkedHashMap<>();
        outputJson.put("collected", collected);
        outputJson.put("isComplete", isComplete);
        outputJson.put("nextPickerHint", agentStyleMemoryStore.nextPickerHint(collected));

        return AgentToolExecutionResult.builder()
                .toolName(AgentToolName.RECORD_STYLE_PREFERENCE)
                .toolType(TOOL_TYPE)
                .status(AgentToolCallStatus.SUCCEEDED)
                .rationale(toolRequest.getRationale())
                .inputJson(inputJson)
                .outputJson(objectMapper.convertValue(outputJson, new TypeReference<Map<String, Object>>() {}))
                .build();
    }
}
