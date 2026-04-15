package com.webgen.webgen_backend.resume_verification_service;

import com.webgen.webgen_backend.dto.profile.verification.connection.ProviderCallbackRequestDTO;
import com.webgen.webgen_backend.dto.profile.verification.connection.ProviderCallbackResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

public interface ProviderOAuthCallbackService {

    /**
     *
     * @param profileId
     * @param provider
     * @param req
     * @return
     */
    ProviderCallbackResponseDTO handleProviderCallback(
            UUID profileId,
            String provider,
            ProviderCallbackRequestDTO req
    );
}
