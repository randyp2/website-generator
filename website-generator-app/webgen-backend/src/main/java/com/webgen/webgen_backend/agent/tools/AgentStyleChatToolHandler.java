package com.webgen.webgen_backend.agent.tools;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.agent.dto.common.AgentToolCallStatus;
import com.webgen.webgen_backend.agent.dto.common.AgentToolName;
import com.webgen.webgen_backend.agent.dto.common.AgentToolRequestDTO;
import com.webgen.webgen_backend.agent.dto.tool.StyleChatToolInputDTO;
import com.webgen.webgen_backend.portfolio.dto.style.StyleChatRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.style.StyleChatResponseDTO;
import com.webgen.webgen_backend.portfolio.service.style.StyleChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AgentStyleChatToolHandler implements AgentToolHandler {

    private static final String TOOL_TYPE = "structured_output";

    private final StyleChatService styleChatService;
    private final ObjectMapper objectMapper;

    @Override
    public Set<AgentToolName> toolNames() {
        return Set.of(AgentToolName.STYLE_CHAT);
    }

    @Override
    public AgentToolExecutionResult execute(UUID portfolioId, AgentToolRequestDTO toolRequest) {
        //--- Convert structured tool arguments into the style chat input contract
        StyleChatToolInputDTO input = objectMapper.convertValue(
                toolRequest.getArguments() == null ? Map.of() : toolRequest.getArguments(),
                StyleChatToolInputDTO.class);

        //--- Build the downstream style chat request for the target portfolio
        StyleChatRequestDTO request = new StyleChatRequestDTO();
        request.setPortfolioId(portfolioId);
        request.setUserMessage(input.getUserMessage());
        request.setColorSelections(input.getColorSelections());
        request.setFontSelections(input.getFontSelections());
        request.setLayoutSelection(input.getLayoutSelection());

        //--- Execute the existing style chat service as an agent tool
        StyleChatResponseDTO response = styleChatService.chat(request);

        //--- Normalize the downstream response into the agent tool result shape
        return AgentToolExecutionResult.builder()
                .toolName(AgentToolName.STYLE_CHAT)
                .toolType(TOOL_TYPE)
                .status(AgentToolCallStatus.SUCCEEDED)
                .rationale(toolRequest.getRationale())
                .inputJson(toolRequest.getArguments() == null ? Map.of() : toolRequest.getArguments())
                .outputJson(objectMapper.convertValue(response, new TypeReference<Map<String, Object>>() {}))
                .build();
    }
}
