package com.webgen.webgen_backend.agent.service.ai;

import org.springframework.ai.chat.prompt.Prompt;

public record AgentAiRequest(Prompt prompt) {
}
