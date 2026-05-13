package com.webgen.webgen_backend.agent.service;

import com.webgen.webgen_backend.agent.entity.AgentMessage;
import com.webgen.webgen_backend.agent.entity.AgentSession;
import org.springframework.ai.chat.prompt.Prompt;

import java.util.List;

public interface AgentPromptBuilder {

    /**
     * Builds the model prompt for a single agent turn from session state and conversation history.
     *
     * @param session active orchestration session for this conversation
     * @param history ordered message history for the session
     * @param latestUserMessage latest normalized user message for the turn
     * @return prompt containing system context and mapped conversation messages
     */
    Prompt buildTurnPrompt(AgentSession session, List<AgentMessage> history, String latestUserMessage);
}
