package com.webgen.webgen_backend.verification.dto.pub;

import lombok.Data;

import java.util.UUID;

@Data
public class PublicVerificationSuggestedActionDTO {
    private UUID claimId;
    private String action;
    private String reason;
    private Integer priority;
}
