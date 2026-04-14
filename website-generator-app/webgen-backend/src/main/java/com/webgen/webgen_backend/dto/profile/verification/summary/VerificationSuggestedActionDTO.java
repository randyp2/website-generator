package com.webgen.webgen_backend.dto.profile.verification.summary;

import lombok.Data;

import java.util.UUID;

@Data
public class VerificationSuggestedActionDTO {
    private UUID claimId;
    private String action;
    private String reason;
    private Integer priority;
}
