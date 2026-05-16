package com.webgen.webgen_backend.agent.service.tool;

import com.webgen.webgen_backend.agent.dto.tool.StyleChatToolInputDTO;
import com.webgen.webgen_backend.portfolio.dto.style.StyleChatRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.style.StyleChatResponseDTO;
import com.webgen.webgen_backend.portfolio.service.style.StyleChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AgentStyleChatToolService {

    private final StyleChatService styleChatService;

    /**
     * Continues the existing style discovery flow using the portfolio-scoped style chat service.
     *
     * The portfolio id is always resolved from tool context, not from model arguments.
     */
    @Tool(
            name = "style_chat_tool",
            description = "Continue the style discovery flow. Use when the user answers style questions or submits color, typography, or layout selections."
    )
    public StyleChatResponseDTO runStyleChat(StyleChatToolInputDTO input, ToolContext toolContext) {
        UUID portfolioId = readPortfolioIdFromContext(toolContext);

        StyleChatRequestDTO request = new StyleChatRequestDTO();
        request.setPortfolioId(portfolioId);
        if (input != null) {
            request.setUserMessage(input.getUserMessage());
            request.setColorSelections(input.getColorSelections());
            request.setFontSelections(input.getFontSelections());
            request.setLayoutSelection(input.getLayoutSelection());
        }

        return styleChatService.chat(request);
    }

    /**
     * Resolves and validates the required portfolio id passed through ToolContext.
     */
    private UUID readPortfolioIdFromContext(ToolContext toolContext) {
        if (toolContext == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "toolContext is required for style_chat_tool");
        }

        Map<String, Object> context = toolContext.getContext();
        Object rawPortfolioId = context.get("portfolioId");
        if (rawPortfolioId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "portfolioId is required in toolContext");
        }

        try {
            return UUID.fromString(String.valueOf(rawPortfolioId));
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid portfolioId in toolContext", exception);
        }
    }
}
