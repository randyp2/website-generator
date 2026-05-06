package com.webgen.webgen_backend.profile.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class ProfileBillingDTO {
    private String activePriceKey;
    private String activePlanKey;
    private String status;
    private OffsetDateTime currentPeriodEnd;
    private Boolean cancelAtPeriodEnd;
    private Integer creditBalance;
}
