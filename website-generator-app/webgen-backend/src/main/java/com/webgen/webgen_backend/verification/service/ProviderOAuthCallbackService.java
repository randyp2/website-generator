package com.webgen.webgen_backend.verification.service;

import com.webgen.webgen_backend.verification.dto.connection.ProviderCallbackRequestDTO;
import com.webgen.webgen_backend.verification.dto.connection.ProviderCallbackResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

public interface ProviderOAuthCallbackService {

    /**
     * Handles the OAuth callback from an external provider after the user approves access.
     * Exchanges the authorization code for an access token, fetches the provider user info,
     * and persists the connected account for the authenticated user.
     *
     * @param profileId authenticated profile id from JWT principal
     * @param provider  OAuth provider key (e.g. "github")
     * @param req       callback payload containing the authorization code and state
     * @return response containing the connected account metadata and sync status
     */
    ProviderCallbackResponseDTO handleProviderCallback(
            UUID profileId,
            String provider,
            ProviderCallbackRequestDTO req
    );
}
