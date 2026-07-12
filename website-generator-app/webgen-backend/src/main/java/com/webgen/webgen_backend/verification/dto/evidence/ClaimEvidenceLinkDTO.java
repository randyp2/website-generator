package com.webgen.webgen_backend.verification.dto.evidence;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class ClaimEvidenceLinkDTO {
    private UUID id;
    private UUID profileId;
    private UUID claimId;
    private UUID evidenceId;
    private String linkType;
    private BigDecimal linkConfidence;
    private BigDecimal evidenceDepth;
    private String reason;
    private JsonNode metadata;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
