package com.webgen.webgen_backend.agent.service.ai;

public interface AgentAiClient {

    /**
     * Sends a prepared agent prompt to the configured chat model.
     *
     * @param request prompt request containing the model-ready Spring AI prompt
     * @return normalized model response with assistant text, model name, and token usage
     */
    AgentAiResponse call(AgentAiRequest request);
}
