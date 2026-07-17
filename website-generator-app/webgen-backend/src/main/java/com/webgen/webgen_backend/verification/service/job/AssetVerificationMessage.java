package com.webgen.webgen_backend.verification.service.job;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetVerificationMessage {
    private String jobId;
    private String uploadId;
    private String claimId;
    private String profileId;
    private UUID creditReservationId;
    private String storageProvider;
    private String storageBucket;
    private String storageKey;
    private Long fileSizeBytes;
    private String queuedAt;
}
