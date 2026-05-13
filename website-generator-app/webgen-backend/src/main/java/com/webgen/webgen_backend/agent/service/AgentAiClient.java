package com.webgen.webgen_backend.agent.service;

import com.webgen.webgen_backend.agent.dto.ai.AgentAiRequestDTO;
import com.webgen.webgen_backend.agent.dto.ai.AgentAiResponseDTO;

public interface AgentAiClient {

    /**
     * Make call to AI client w/ availalbe tooling
     *
     * @param req DTO request containing:
     *            - prompt
     *            - available tooling
     *
     * @return assistant message with relevant metadata
     *
     */
    AgentAiResponseDTO call(AgentAiRequestDTO req);
}
