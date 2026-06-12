package com.webgen.webgen_backend.agent.service.impl;

import com.webgen.webgen_backend.agent.entity.AgentMessage;
import com.webgen.webgen_backend.agent.entity.AgentMessageRole;
import com.webgen.webgen_backend.agent.entity.AgentSession;
import com.webgen.webgen_backend.agent.service.AgentPromptBuilder;
import com.webgen.webgen_backend.shared.prompt.PromptTemplateLoader;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AgentPromptBuilderImpl implements AgentPromptBuilder {

    private static final int MAX_HISTORY_MESSAGES = 24;
    private static final String SYSTEM_TEMPLATE_PATH = "prompts/agent/agent-turn-system.md";
    private static final String TOOLS_TEMPLATE_PATH = "prompts/agent/agent-tools.md";

    private final PromptTemplateLoader promptTemplateLoader;

    @Override
    public Prompt buildTurnPrompt(AgentSession session, List<AgentMessage> history, String latestUserMessage) {
        List<Message> messages = new ArrayList<>();

        // --- Append overall role message for context
        messages.add(new SystemMessage(buildSystemInstruction(session)));

        // --- Add recent timeline messages in chronological order.
        List<AgentMessage> recentHistory = selectRecentHistory(history);
        for (AgentMessage timelineMessage : recentHistory) {
            appendMappedMessage(messages, timelineMessage);
        }

        // Ensure the latest user input exists even if history retrieval was stale.
        if (shouldAppendLatestUserMessage(recentHistory, latestUserMessage)) {
            messages.add(new UserMessage(latestUserMessage));
        }

        return Prompt.builder()
                .messages(messages)
                .build();
    }

    /**
     * Builds a stable system instruction from session stage and memory state.
     */
    private String buildSystemInstruction(AgentSession session) {
        String stage = session.getStage().name();
        String memoryJson = toCdataSafeText(String.valueOf(session.getMemoryJson()));

        String systemInstruction = promptTemplateLoader
                .load(SYSTEM_TEMPLATE_PATH)
                .formatted(stage, stage, memoryJson);
        String toolCatalog = promptTemplateLoader.load(TOOLS_TEMPLATE_PATH);
        return systemInstruction + "\n\n" + toolCatalog;
    }

    /**
     * Returns only the most recent messages to keep prompt size bounded.
     */
    private List<AgentMessage> selectRecentHistory(List<AgentMessage> history) {
        if (history == null || history.isEmpty()) {
            return List.of();
        }
        int fromIndex = Math.max(0, history.size() - MAX_HISTORY_MESSAGES);
        return history.subList(fromIndex, history.size());
    }

    /**
     * Converts a stored agent message row into a Spring AI chat message.
     */
    private void appendMappedMessage(List<Message> target, AgentMessage source) {
        String content = normalizeContent(source);
        AgentMessageRole role = source.getRole();

        if (role == AgentMessageRole.USER) {
            target.add(new UserMessage(content));
            return;
        }
        if (role == AgentMessageRole.ASSISTANT) {
            target.add(new AssistantMessage(content));
            return;
        }
        if (role == AgentMessageRole.SYSTEM) {
            target.add(new SystemMessage(content));
            return;
        }

        String toolLabel = source.getToolName() == null ? "unknown_tool" : source.getToolName();
        String toolCallId = source.getToolCallId() == null ? "unknown_call_id" : source.getToolCallId();
        target.add(new UserMessage("""
                <tool_result>
                  <tool_name>%s</tool_name>
                  <tool_call_id>%s</tool_call_id>
                  <output>%s</output>
                </tool_result>
                """.formatted(toolLabel, toolCallId, content)));
    }

    /**
     * Normalizes nullable message content before mapping to model messages.
     */
    private String normalizeContent(AgentMessage source) {
        if (source == null || source.getContent() == null || source.getContent().isBlank()) {
            return "";
        }
        return source.getContent().trim();
    }

    /**
     * Checks if we should append latest user text as a fallback guard.
     */
    private boolean shouldAppendLatestUserMessage(List<AgentMessage> recentHistory, String latestUserMessage) {
        if (latestUserMessage == null || latestUserMessage.isBlank()) {
            return false;
        }
        if (recentHistory.isEmpty()) {
            return true;
        }
        AgentMessage last = recentHistory.get(recentHistory.size() - 1);
        return last.getRole() != AgentMessageRole.USER;
    }

    /**
     * Makes text safe for XML CDATA sections.
     */
    private String toCdataSafeText(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("]]>", "]]]]><![CDATA[>");
    }
}
