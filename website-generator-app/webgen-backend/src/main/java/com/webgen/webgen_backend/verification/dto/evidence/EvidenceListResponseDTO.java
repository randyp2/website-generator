package com.webgen.webgen_backend.verification.dto.evidence;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class EvidenceListResponseDTO {
    private List<EvidenceDTO> items;
    private String nextCursor;
}
