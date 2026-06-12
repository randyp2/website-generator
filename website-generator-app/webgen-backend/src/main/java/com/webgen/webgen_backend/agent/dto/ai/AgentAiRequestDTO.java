package com.webgen.webgen_backend.agent.dto.ai;

import lombok.Builder;
import lombok.Data;
import org.springframework.ai.chat.prompt.Prompt;

@Data
@Builder
public class AgentAiRequestDTO {
    private Prompt prompt;
}
