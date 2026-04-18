package com.webgen.webgen_backend.verification.dto.connection;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProviderCallbackRequestDTO {
    /**
     * OAuth authorization code returned by the provider callback.
     */
    private String code;

    /**
     * CSRF state value returned by the provider callback.
     */
    private String state;
}
