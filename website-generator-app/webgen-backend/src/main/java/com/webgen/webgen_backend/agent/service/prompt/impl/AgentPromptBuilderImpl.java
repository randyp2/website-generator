package com.webgen.webgen_backend.agent.service.prompt.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.agent.dto.AgentStructuredPlanDTO;
import com.webgen.webgen_backend.agent.entity.AgentMessage;
import com.webgen.webgen_backend.agent.entity.AgentMessageRole;
import com.webgen.webgen_backend.agent.entity.AgentSession;
import com.webgen.webgen_backend.agent.service.prompt.AgentPromptBuilder;
import com.webgen.webgen_backend.agent.tools.AgentToolExecutionResult;
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
    private static final String SYNTHESIS_TEMPLATE_PATH = "prompts/agent/agent-synthesis-system.md";

    private final PromptTemplateLoader promptTemplateLoader;
    private final ObjectMapper objectMapper;

    @Override
    public Prompt buildTurnPrompt(AgentSession session, List<AgentMessage> history, String latestUserMessage) {
        List<Message> messages = new ArrayList<>();

        //--- Append overall role message for context
        messages.add(new SystemMessage(buildSystemInstruction(session)));

        //--- Add recent timeline messages in chronological order
        List<AgentMessage> recentHistory = selectRecentHistory(history);
        for (AgentMessage timelineMessage : recentHistory) {
            appendMappedMessage(messages, timelineMessage);
        }

        //--- Ensure the latest user input exists even if history retrieval was stale
        if (shouldAppendLatestUserMessage(recentHistory, latestUserMessage)) {
            messages.add(new UserMessage(latestUserMessage));
        }

        return Prompt.builder()
                .messages(messages)
                .build();
    }

    @Override
    public Prompt buildSynthesisPrompt(
            AgentSession session,
            String latestUserMessage,
            AgentStructuredPlanDTO plan,
            List<AgentToolExecutionResult> toolResults) {
        //--- Package planner output and tool results as synthesis context
        String synthesisContext = """
                <latest_user_message>
                %s
                </latest_user_message>

                <planner_response_json>
                %s
                </planner_response_json>

                <tool_results_json>
                %s
                </tool_results_json>
                """.formatted(
                latestUserMessage == null ? "" : latestUserMessage,
                objectMapper.valueToTree(plan).toPrettyString(),
                objectMapper.valueToTree(toolResults == null ? List.of() : toolResults).toPrettyString());

        //--- Build a focused prompt for final answer synthesis
        return Prompt.builder()
                .messages(List.of(
                        new SystemMessage(buildSynthesisInstruction(session)),
                        new UserMessage(synthesisContext)))
                .build();
    }

    /**
     * Builds a stable system instruction from session stage and memory state.
     */
    private String buildSystemInstruction(AgentSession session) {
        //--- Bind current session state into the planner system prompt
        String stage = session.getStage().name();
        String memoryJson = toCdataSafeText(String.valueOf(session.getMemoryJson()));

        //--- Append the externalized tool catalog to the planner instruction
        String systemInstruction = promptTemplateLoader
                .load(SYSTEM_TEMPLATE_PATH)
                .formatted(stage, stage, memoryJson);
        String toolCatalog = promptTemplateLoader.load(TOOLS_TEMPLATE_PATH);
        return systemInstruction + "\n\n" + toolCatalog;
    }

    private String buildSynthesisInstruction(AgentSession session) {
        //--- Bind current session state into the synthesis system prompt
        String stage = session.getStage().name();
        String memoryJson = toCdataSafeText(String.valueOf(session.getMemoryJson()));
        return promptTemplateLoader.load(SYNTHESIS_TEMPLATE_PATH) + """

                ## Session Context
                Current stage snapshot: `%s`

                Memory JSON:
                ```json
                %s
                ```
                """.formatted(stage, memoryJson);
    }

    /**
     * Returns only the most recent messages to keep prompt size bounded.
     */
    private List<AgentMessage> selectRecentHistory(List<AgentMessage> history) {
        //--- Drop old messages once the prompt history cap is reached
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
        //--- Normalize stored content before mapping by role
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

        //--- Represent persisted tool output as model-readable context
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
        //--- Collapse nullable or blank content into an empty model message
        if (source == null || source.getContent() == null || source.getContent().isBlank()) {
            return "";
        }
        return source.getContent().trim();
    }

    /**
     * Checks if we should append latest user text as a fallback guard.
     */
    private boolean shouldAppendLatestUserMessage(List<AgentMessage> recentHistory, String latestUserMessage) {
        //--- Avoid duplicating the latest user message when history already contains it
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
        //--- Escape CDATA terminators before placing memory in prompt XML
        if (value == null) {
            return "";
        }
        return value.replace("]]>", "]]]]><![CDATA[>");
    }
}
