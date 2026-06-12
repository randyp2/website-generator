package com.webgen.webgen_backend.agent.service;

import com.webgen.webgen_backend.agent.dto.AgentStructuredPlanDTO;
import com.webgen.webgen_backend.agent.tools.AgentToolExecutionResult;

import java.util.List;

public interface AgentSynthesisService {
    String synthesize(AgentStructuredPlanDTO plan, List<AgentToolExecutionResult> toolResults);
}
