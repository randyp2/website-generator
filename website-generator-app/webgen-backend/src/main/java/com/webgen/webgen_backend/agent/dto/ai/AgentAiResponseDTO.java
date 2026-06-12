package com.webgen.webgen_backend.agent.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentAiResponseDTO {
    private String assistedText;
    private String model;
    private Integer inputTokens;
    private Integer outputTokens;
}
