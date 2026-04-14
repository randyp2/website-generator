package com.webgen.webgen_backend.dto.profile.verification.connection;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConnectProviderResponseDTO {
    /**
     * Sanitized persisted connection state after connect init/upsert.
     */
    private ConnectedAccountDTO connection;

    /**
     * OAuth authorization URL for the provider when connect flow is enabled.
     * Can be null in early lifecycle steps.
     */
    private String authorizationUrl;

    /**
     * CSRF state value tied to the pending OAuth transaction.
     * Can be null in early lifecycle steps.
     */
    private String state;
}
