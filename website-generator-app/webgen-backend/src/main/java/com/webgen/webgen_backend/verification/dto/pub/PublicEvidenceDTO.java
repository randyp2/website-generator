package com.webgen.webgen_backend.verification.dto.pub;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PublicEvidenceDTO {
    private UUID id;
    private String provider;
    private String externalId;
    private String evidenceType;
    private String title;
    private String description;
    private String sourceUrl;
    private OffsetDateTime occurredAt;
    private OffsetDateTime capturedAt;
    private JsonNode metadata;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private List<PublicEvidenceLinkDTO> links;
}
