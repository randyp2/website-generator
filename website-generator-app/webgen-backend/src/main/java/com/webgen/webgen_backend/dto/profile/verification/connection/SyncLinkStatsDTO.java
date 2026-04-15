package com.webgen.webgen_backend.dto.profile.verification.connection;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SyncLinkStatsDTO {
    private Integer inserted;
    private Integer updated;
    private Integer removed;
    private Integer claimsMatched;
}
