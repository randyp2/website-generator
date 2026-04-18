package com.webgen.webgen_backend.verification.service;

import com.webgen.webgen_backend.verification.dto.connection.ProviderCallbackRequestDTO;
import com.webgen.webgen_backend.verification.dto.connection.ProviderCallbackResponseDTO;
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
