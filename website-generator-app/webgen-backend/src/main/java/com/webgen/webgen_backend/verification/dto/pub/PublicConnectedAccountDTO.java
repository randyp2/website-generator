package com.webgen.webgen_backend.verification.dto.pub;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class PublicConnectedAccountDTO {
    private String provider;
    private String status;
    private OffsetDateTime connectedAt;
    private OffsetDateTime lastSyncedAt;
    private String lastSyncStatus;
    private OffsetDateTime lastSyncCompletedAt;
    private Integer lastSyncImportedCount;
    private Integer lastSyncLinkedCount;
}
