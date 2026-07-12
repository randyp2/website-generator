package com.webgen.webgen_backend.verification.dto.evidence;

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
    private BigDecimal evidenceDepth;
    private String reason;
    private String sourceFile;
}
