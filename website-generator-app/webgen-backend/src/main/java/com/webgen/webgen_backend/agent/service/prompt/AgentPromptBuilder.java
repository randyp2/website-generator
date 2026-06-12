package com.webgen.webgen_backend.agent.service.prompt;

import com.webgen.webgen_backend.agent.dto.AgentStructuredPlanDTO;
import com.webgen.webgen_backend.agent.entity.AgentMessage;
import com.webgen.webgen_backend.agent.entity.AgentSession;
import com.webgen.webgen_backend.agent.tools.AgentToolExecutionResult;
import org.springframework.ai.chat.prompt.Prompt;

import java.util.List;

public interface AgentPromptBuilder {

    /**
     * Builds the planner prompt for a single agent turn.
     *
     * The prompt includes the agent system instruction, tool catalog, bounded conversation history,
     * session state, session memory, and the latest user message when it is not already present in
     * history.
     *
     * @param session active orchestration session for this conversation
     * @param history ordered message history for the session
     * @param latestUserMessage latest normalized user message for the turn
     * @return prompt containing system context and mapped conversation messages
     */
    Prompt buildTurnPrompt(AgentSession session, List<AgentMessage> history, String latestUserMessage);

    /**
     * Builds the synthesis prompt used after dependent-read tools have executed.
     *
     * The prompt gives the model the original user message, planner response, session context, and
     * normalized tool results so it can produce the final assistant message without requesting more
     * tools.
     *
     * @param session active orchestration session for this conversation
     * @param latestUserMessage latest normalized user message for the turn
     * @param plan structured planner response that requested the executed tools
     * @param toolResults normalized results returned by the agent tool executor
     * @return prompt containing synthesis instructions and answer-bearing tool output
     */
    Prompt buildSynthesisPrompt(
            AgentSession session,
            String latestUserMessage,
            AgentStructuredPlanDTO plan,
            List<AgentToolExecutionResult> toolResults);
}
