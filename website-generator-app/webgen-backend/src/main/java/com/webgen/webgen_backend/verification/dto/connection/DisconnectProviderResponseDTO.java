package com.webgen.webgen_backend.verification.dto.connection;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DisconnectProviderResponseDTO {
    /**
     * Sanitized persisted connection state after disconnect.
     */
    private ConnectedAccountDTO connection;
}
