package com.webgen.webgen_backend.agent.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class AgentTurnRequestDTO {
    private UUID portfolioId;
    private String userMessage;
}
