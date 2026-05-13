package com.webgen.webgen_backend.verification.dto.job;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetVerificationEnqueueDTO {
    private UUID profileId;
    private UUID claimId;
    private UUID uploadId;
    private String storageProvider;
    private String storageBucket;
    private String storageKey;
    private Long fileSizeBytes;
}
