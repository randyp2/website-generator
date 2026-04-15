package com.webgen.webgen_backend.dto.profile.verification.connection;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProviderCallbackResponseDTO {
    /**
     * Sanitized persisted connection state after callback processing.
     */
    private ConnectedAccountDTO connection;
}
