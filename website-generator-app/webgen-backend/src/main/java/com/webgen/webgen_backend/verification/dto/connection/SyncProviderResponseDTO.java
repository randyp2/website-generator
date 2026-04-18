package com.webgen.webgen_backend.verification.dto.connection;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class SyncProviderResponseDTO {
    private String provider;
    private String syncStatus;
    private OffsetDateTime startedAt;
    private OffsetDateTime completedAt;
    private Boolean tokenRefreshed;
    private SyncEvidenceStatsDTO evidence;
    private SyncLinkStatsDTO links;
    private String error;
}
