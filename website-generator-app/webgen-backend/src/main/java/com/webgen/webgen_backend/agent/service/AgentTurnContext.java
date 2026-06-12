package com.webgen.webgen_backend.agent.service;

import com.webgen.webgen_backend.agent.entity.AgentMessage;
import com.webgen.webgen_backend.agent.entity.AgentRun;
import com.webgen.webgen_backend.agent.entity.AgentSession;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;

import java.util.List;

public record AgentTurnContext(
        Portfolio portfolio,
        AgentSession session,
        AgentRun run,
        AgentMessage userMessage,
        List<AgentMessage> history) {
}
