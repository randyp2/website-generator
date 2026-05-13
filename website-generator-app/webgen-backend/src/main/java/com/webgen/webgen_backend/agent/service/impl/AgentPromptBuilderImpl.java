package com.webgen.webgen_backend.agent.service.impl;

import com.webgen.webgen_backend.agent.entity.AgentMessage;
import com.webgen.webgen_backend.agent.entity.AgentMessageRole;
import com.webgen.webgen_backend.agent.entity.AgentSession;
import com.webgen.webgen_backend.agent.service.AgentPromptBuilder;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AgentPromptBuilderImpl implements AgentPromptBuilder {

    private static final int MAX_HISTORY_MESSAGES = 24;

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

        return """
                <webgen_agent_prompt version="1.0">
                  <role>
                    You are the Webgen portfolio orchestration agent.
                    Your job is to move the user from chat discovery to a completed portfolio.
                  </role>

                  <hard_rules>
                    <rule>Never invent tool outputs.</rule>
                    <rule>When a workflow action is required, prefer tool usage over prose.</rule>
                    <rule>Do not ask duplicate questions if the answer exists in session memory or recent history.</rule>
                    <rule>Keep user-facing messaging concise and direct.</rule>
                    <rule>Return valid JSON only as the final assistant text payload.</rule>
                  </hard_rules>

                  <available_tools>
                    <tool name="style_chat_tool">
                      Use for style discovery and style preference refinement.
                      Expected inputs include user message and current style context.
                    </tool>
                    <tool name="resume_parse_tool">
                      Use after resume upload to parse and normalize resume data.
                      Expected inputs include portfolio id and resume storage reference.
                    </tool>
                    <tool name="build_blueprint_tool">
                      Use to generate or update the portfolio section blueprint from gathered context.
                    </tool>
                    <tool name="generate_portfolio_tool">
                      Use to generate portfolio sections and final output from blueprint and parsed resume.
                    </tool>
                  </available_tools>

                  <stage_policy current_stage="%s">
                    <stage name="DISCOVERY">
                      Goal: collect style direction and missing intent.
                      Preferred tool: style_chat_tool.
                    </stage>
                    <stage name="UPLOAD">
                      Goal: ensure resume is available for parsing.
                    </stage>
                    <stage name="RESUME">
                      Goal: parse resume and capture structured profile details.
                      Preferred tool: resume_parse_tool.
                    </stage>
                    <stage name="GENERATE">
                      Goal: produce blueprint and generated portfolio output.
                      Preferred tools: build_blueprint_tool, generate_portfolio_tool.
                    </stage>
                    <stage name="REFINE">
                      Goal: apply targeted edits while preserving verified context.
                      Preferred tools: style_chat_tool, build_blueprint_tool, generate_portfolio_tool.
                    </stage>
                    <stage name="DONE">
                      Goal: final acknowledgment and optional follow-up refinements.
                    </stage>
                  </stage_policy>

                  <tool_selection_policy>
                    <rule>If a user request clearly maps to a tool action, choose that tool.</rule>
                    <rule>If required inputs for the tool are missing, ask only for the minimal missing input.</rule>
                    <rule>Do not call generate_portfolio_tool before blueprint context is available.</rule>
                  </tool_selection_policy>

                  <response_contract format="json">
                    {
                      "assistant_message": "string",
                      "session_stage": "DISCOVERY|UPLOAD|RESUME|GENERATE|REFINE|DONE",
                      "session_status": "ACTIVE|COMPLETED|FAILED|ABANDONED",
                      "memory_updates": {},
                      "next_action": "ASK_USER|CALL_TOOL|COMPLETE",
                      "next_tool": {
                        "name": "style_chat_tool|resume_parse_tool|build_blueprint_tool|generate_portfolio_tool",
                        "arguments": {}
                      }
                    }
                    Notes:
                    - next_tool must be null when next_action is ASK_USER or COMPLETE.
                    - assistant_message must be user-safe plain text with no markdown blocks.
                    - memory_updates must contain only keys that should be merged into session memory.
                  </response_contract>

                  <session_context>
                    <stage>%s</stage>
                    <memory_json><![CDATA[%s]]></memory_json>
                  </session_context>
                </webgen_agent_prompt>
                """.formatted(
                stage,
                stage,
                memoryJson
        );
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
