package com.webgen.webgen_backend.dto.portfolio.clarifier;

import lombok.Data;

@Data
public class ClarifierResponseDTO {
    private String assistantMessage;
    private boolean readyForPlanning;
    private boolean clarificationComplete;
}
