package com.webgen.webgen_backend.billing.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreatePortalSessionResponseDTO {

    private String sessionId;
    private String portalUrl;
}
