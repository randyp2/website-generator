package com.webgen.webgen_backend.verification.dto.evidence;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.util.UUID;

@Data
public class FinalizeClaimEvidenceUploadRequestDTO {
    private UUID uploadId;
    private JsonNode metadata;
}

