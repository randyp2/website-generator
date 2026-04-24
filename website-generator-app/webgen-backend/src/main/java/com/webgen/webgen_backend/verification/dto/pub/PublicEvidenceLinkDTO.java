package com.webgen.webgen_backend.verification.dto.pub;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class PublicEvidenceLinkDTO {
    private UUID claimId;
    private String linkType;
    private BigDecimal linkConfidence;
    private String reason;
}
