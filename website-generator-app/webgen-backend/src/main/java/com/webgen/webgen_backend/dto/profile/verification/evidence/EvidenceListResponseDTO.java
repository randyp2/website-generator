package com.webgen.webgen_backend.dto.profile.verification.evidence;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class EvidenceListResponseDTO {
    private List<EvidenceDTO> items;
    private String nextCursor;
}
