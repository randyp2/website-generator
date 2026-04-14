package com.webgen.webgen_backend.dto.profile.verification.connection;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ConnectedAccountDTO {
    private UUID id;
    private UUID profileId;
    private String provider;
    private String providerUserId;
    private String status;
    private List<String> scopes;
    private OffsetDateTime lastSyncedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
