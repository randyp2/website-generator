package com.webgen.webgen_backend.verification.dto.job;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetVerificationResultDTO {
    private Double confidence;
    private String summary;
}
