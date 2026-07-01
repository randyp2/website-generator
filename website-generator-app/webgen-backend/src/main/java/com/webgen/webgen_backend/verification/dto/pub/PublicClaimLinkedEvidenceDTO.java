package com.webgen.webgen_backend.verification.dto.pub;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class PublicClaimLinkedEvidenceDTO {
    private UUID evidenceId;
    private String provider;
    private String externalId;
    private String evidenceType;
    private String title;
    private String sourceUrl;
    private OffsetDateTime capturedAt;
    private String linkType;
    private BigDecimal linkConfidence;
    private String reason;
    private String sourceFile;
}
