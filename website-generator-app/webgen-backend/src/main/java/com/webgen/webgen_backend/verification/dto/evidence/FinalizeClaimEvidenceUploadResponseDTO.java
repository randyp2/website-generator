package com.webgen.webgen_backend.verification.dto.evidence;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FinalizeClaimEvidenceUploadResponseDTO {
    private ClaimEvidenceUploadDTO upload;
    private String jobId;
}
