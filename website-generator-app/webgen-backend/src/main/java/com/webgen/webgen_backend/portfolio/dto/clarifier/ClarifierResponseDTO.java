package com.webgen.webgen_backend.portfolio.dto.clarifier;

import lombok.Data;

@Data
public class ClarifierResponseDTO {
    private String assistantMessage;
    private String sessionId;
    private boolean readyForPlanning;
    private boolean clarificationComplete;
}
