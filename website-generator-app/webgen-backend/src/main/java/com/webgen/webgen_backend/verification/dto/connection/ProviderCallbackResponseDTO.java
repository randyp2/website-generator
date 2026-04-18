package com.webgen.webgen_backend.verification.dto.connection;

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
