package com.webgen.webgen_backend.verification.dto.evidence;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ClaimEvidenceUploadListResponseDTO {
    private List<ClaimEvidenceUploadDTO> items;
    private String nextCursor;
}

