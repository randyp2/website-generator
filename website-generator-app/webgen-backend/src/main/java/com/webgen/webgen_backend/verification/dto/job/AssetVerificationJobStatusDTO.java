package com.webgen.webgen_backend.verification.dto.job;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetVerificationJobStatusDTO {
    public enum Status {
        QUEUED,             // Pushed to redis list
        PROCESSING,         // Running through verification
        COMPLETED,          // Verification successful
        FAILED,             // Verification failed
        CANCELED            // Account deletion stopped the job
    }

    private String jobId;
    private String uploadId;
    private String claimId;
    private String profileId;
    private Status status;
    private String error;
}
