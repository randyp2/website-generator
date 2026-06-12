package com.webgen.webgen_backend.agent.service.ai;

public record AgentAiResponse(
        String assistedText,
        String model,
        Integer inputTokens,
        Integer outputTokens) {
}
