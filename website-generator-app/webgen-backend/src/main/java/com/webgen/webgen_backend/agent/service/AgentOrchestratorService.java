package com.webgen.webgen_backend.agent.service;

import com.webgen.webgen_backend.agent.dto.AgentChatTurnResponseDTO;

import java.util.UUID;

public interface AgentOrchestratorService {
    AgentChatTurnResponseDTO processTurn(UUID userId, UUID portfolioId, String userMessage);
}
