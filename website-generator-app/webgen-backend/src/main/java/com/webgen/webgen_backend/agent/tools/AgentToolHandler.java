package com.webgen.webgen_backend.agent.tools;

import com.webgen.webgen_backend.agent.dto.common.AgentToolName;
import com.webgen.webgen_backend.agent.dto.common.AgentToolRequestDTO;

import java.util.Set;
import java.util.UUID;

public interface AgentToolHandler {

    Set<AgentToolName> toolNames();

    AgentToolExecutionResult execute(UUID portfolioId, AgentToolRequestDTO toolRequest);

    default boolean feedsSynthesis() {
        return false;
    }
}
