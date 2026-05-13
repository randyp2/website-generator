package com.webgen.webgen_backend.agent.service;

import com.webgen.webgen_backend.agent.dto.AgentTurnResultDTO;

import java.util.UUID;

public interface AgentOrchestratorService {

    /**
     * Processes one synchronous agent turn for a portfolio.
     *
     * This method persists the user message, creates a run record, generates an
     * assistant reply, and finalizes the run/session state in durable storage.
     *
     * @param userId authenticated user id
     * @param portfolioId target portfolio id
     * @param userMessage raw user message for this turn
     * @return persisted turn result with session/run/message identifiers and assistant output
     */
    AgentTurnResultDTO processTurn(UUID userId, UUID portfolioId, String userMessage);
}
