package com.webgen.webgen_backend.agent.service;

import com.webgen.webgen_backend.agent.dto.AgentChatTurnResponseDTO;

import java.util.UUID;

public interface AgentOrchestratorService {

    /**
     * Processes one user turn for the agent-backed portfolio conversation.
     *
     * @param userId authenticated user id that owns the portfolio
     * @param portfolioId target portfolio id for the agent turn
     * @param userMessage raw user message submitted by the client
     * @return completed turn response containing the assistant message, structured plan, and tool calls
     */
    AgentChatTurnResponseDTO processTurn(UUID userId, UUID portfolioId, String userMessage);
}
