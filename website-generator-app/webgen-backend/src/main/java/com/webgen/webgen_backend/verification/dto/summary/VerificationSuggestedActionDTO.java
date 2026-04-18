package com.webgen.webgen_backend.verification.dto.summary;

import lombok.Data;

import java.util.UUID;

@Data
public class VerificationSuggestedActionDTO {
    private UUID claimId;
    private String action;
    private String reason;
    private Integer priority;
}
