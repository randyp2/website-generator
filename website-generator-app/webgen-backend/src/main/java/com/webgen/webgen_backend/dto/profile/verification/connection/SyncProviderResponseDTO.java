package com.webgen.webgen_backend.dto.profile.verification.connection;

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
