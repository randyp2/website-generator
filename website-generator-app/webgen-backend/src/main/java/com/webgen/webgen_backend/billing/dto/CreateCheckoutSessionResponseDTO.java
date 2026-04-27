package com.webgen.webgen_backend.billing.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreateCheckoutSessionResponseDTO {

    private String sessionId;
    private String checkoutUrl;
    private String mode;
}
