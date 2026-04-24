package com.webgen.webgen_backend.verification.dto.pub;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PublicClaimEvidenceSummaryDTO {
    private UUID claimId;
    private Integer linkedEvidenceCount;
    private List<PublicClaimLinkedEvidenceDTO> linkedEvidence;
}
