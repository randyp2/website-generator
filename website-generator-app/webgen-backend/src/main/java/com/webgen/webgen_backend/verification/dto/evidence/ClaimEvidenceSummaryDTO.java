package com.webgen.webgen_backend.verification.dto.evidence;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ClaimEvidenceSummaryDTO {
    private UUID claimId;
    private Integer linkedEvidenceCount;
    private List<ClaimLinkedEvidenceDTO> linkedEvidence;
}
