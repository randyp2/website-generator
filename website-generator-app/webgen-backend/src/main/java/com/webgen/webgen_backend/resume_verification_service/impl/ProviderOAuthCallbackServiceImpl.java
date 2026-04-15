package com.webgen.webgen_backend.resume_verification_service.impl;

import com.webgen.webgen_backend.dto.profile.verification.connection.ProviderCallbackRequestDTO;
import com.webgen.webgen_backend.dto.profile.verification.connection.ProviderCallbackResponseDTO;
import com.webgen.webgen_backend.entity.ConnectedAccount;
import com.webgen.webgen_backend.mapper.ConnectedAccountMapper;
import com.webgen.webgen_backend.repository.ConnectedAccountRepository;
import com.webgen.webgen_backend.resume_verification_service.ProviderOAuthCallbackService;
import com.webgen.webgen_backend.resume_verification_service.shared.ProviderNormalizationHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProviderOAuthCallbackServiceImpl implements ProviderOAuthCallbackService {

    private static final Set<String> SUPPORTED_PROVIDERS = Set.of("github");
    private static final String STATUS_PENDING = "pending";

    private final ConnectedAccountRepository connectedAccountRepository;
    private final ConnectedAccountMapper connectedAccountMapper;

    @Override
    @Transactional
    public ProviderCallbackResponseDTO handleProviderCallback(
            UUID profileId,
            String provider,
            ProviderCallbackRequestDTO req
    ) {
        String normalizedProvider = ProviderNormalizationHelper.normalizeProvider(
                provider,
                SUPPORTED_PROVIDERS
        );

        validateRequest(req);

        ConnectedAccount account = connectedAccountRepository
                .findByProfileIdAndProvider(profileId, normalizedProvider)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Connected account not found"
                ));

        OffsetDateTime now = OffsetDateTime.now();
        validateOauthState(account, req.getState(), now);

        // Callback foundation only: consume validated OAuth state, keep account pending.
        account.setStatus(STATUS_PENDING);
        account.setOauthState(null);
        account.setOauthStateExpiresAt(null);
        account.setUpdatedAt(now);

        ConnectedAccount saved = connectedAccountRepository.save(account);
        return ProviderCallbackResponseDTO.builder()
                .connection(connectedAccountMapper.toDto(saved))
                .build();
    }

    // Validate required callback query payload (code + state).
    private void validateRequest(ProviderCallbackRequestDTO req) {
        if (req == null
                || req.getCode() == null || req.getCode().isBlank()
                || req.getState() == null || req.getState().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "code and state are required");
        }
    }

    // Enforce state existence, freshness, and equality to prevent CSRF/replay.
    private void validateOauthState(
            ConnectedAccount account,
            String providedState,
            OffsetDateTime now
    ) {
        if (account.getOauthState() == null || account.getOauthStateExpiresAt() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No pending OAuth state");
        }
        if (now.isAfter(account.getOauthStateExpiresAt())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "OAuth state expired");
        }
        if (!account.getOauthState().equals(providedState)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "OAuth state mismatch");
        }
    }
}
