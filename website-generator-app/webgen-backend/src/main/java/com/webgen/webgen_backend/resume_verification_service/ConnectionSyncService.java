package com.webgen.webgen_backend.resume_verification_service;

import com.webgen.webgen_backend.dto.profile.verification.connection.SyncProviderResponseDTO;

import java.util.UUID;

public interface ConnectionSyncService {

    /**
     * Manually triggers provider sync for one connected account.
     *
     * The implementation owns sync lifecycle metadata updates on
     * and returns a structured result payload for UI.
     *
     * @param profileId authenticated profile id
     * @param provider provider key (for example github)
     * @return sync execution result
     */
    SyncProviderResponseDTO syncProvider(UUID profileId, String provider);
}
