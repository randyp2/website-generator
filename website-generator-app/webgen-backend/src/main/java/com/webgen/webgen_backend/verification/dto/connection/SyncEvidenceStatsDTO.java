package com.webgen.webgen_backend.verification.dto.connection;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SyncEvidenceStatsDTO {
    private Integer fetched;
    private Integer inserted;
    private Integer updated;
    private Integer unchanged;
}
