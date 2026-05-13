package com.webgen.webgen_backend.agent.dto.ai;

import org.springframework.ai.chat.prompt.Prompt;

import java.util.List;
import java.util.Map;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AgentAiRequestDTO {

    // Base prompt for ai orchestration
    Prompt prompt;

    // Callable tool beans that agent has access too
    List<Object> tools;

    // Extra context to explain the tooling available
    Map<String, String> toolContext;
}
