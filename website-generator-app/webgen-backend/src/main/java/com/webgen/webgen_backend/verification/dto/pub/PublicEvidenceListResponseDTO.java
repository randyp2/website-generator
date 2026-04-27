package com.webgen.webgen_backend.verification.dto.pub;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PublicEvidenceListResponseDTO {
    private List<PublicEvidenceDTO> items;
    private String nextCursor;
}
