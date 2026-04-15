package com.webgen.webgen_backend.dto.profile.verification.evidence;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class EvidenceLinkDTO {
    private UUID claimId;
    private String linkType;
    private BigDecimal linkConfidence;
    private String reason;
}
