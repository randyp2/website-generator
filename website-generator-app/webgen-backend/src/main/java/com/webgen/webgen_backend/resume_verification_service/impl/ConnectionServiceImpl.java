package com.webgen.webgen_backend.resume_verification_service.impl;

import com.webgen.webgen_backend.dto.profile.verification.connection.ConnectProviderResponseDTO;
import com.webgen.webgen_backend.dto.profile.verification.connection.ConnectedAccountDTO;
import com.webgen.webgen_backend.dto.profile.verification.connection.DisconnectProviderResponseDTO;
import com.webgen.webgen_backend.entity.ConnectedAccount;
import com.webgen.webgen_backend.entity.Profile;
import com.webgen.webgen_backend.repository.ConnectedAccountRepository;
import com.webgen.webgen_backend.repository.ProfileRepository;
import com.webgen.webgen_backend.resume_verification_service.ConnectionService;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ConnectionServiceImpl implements ConnectionService {

    private final ConnectedAccountRepository connectedAccountRepository;
    private final ProfileRepository profileRepository;

    private static final Set<String> SUPPORTED_PROVIDERS = Set.of(
            "linkedin",
            "github",
            "website",
            "other"
    );

    private static final String STATUS_PENDING = "pending";
    private static final String STATUS_DISCONNECTED = "disconnected";

    @Override
    @Transactional
    public ConnectProviderResponseDTO connectProvider(UUID profileId, String provider) {

        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

        String normalize = normalizeProvider(provider);

        OffsetDateTime now = OffsetDateTime.now();

        ConnectedAccount connectedAccount = connectedAccountRepository
                .findByProfileIdAndProvider(profileId, normalize)
                .orElseGet(() -> {
                    ConnectedAccount account = new ConnectedAccount();
                    account.setId(UUID.randomUUID());
                    account.setProfile(profile);
                    account.setProvider(provider);
                    account.setScopes(new String[0]); // No scopes upon connecting
                    account.setCreatedAt(now);
                    account.setUpdatedAt(now);

                    return account;
                });

        // Ensure data in consistent
        connectedAccount.setProfile(profile);
        connectedAccount.setProvider(provider);
        connectedAccount.setStatus(STATUS_PENDING);
        if (connectedAccount.getScopes() == null)
            connectedAccount.setScopes(new String[0]);
        connectedAccount.setUpdatedAt(now);

        ConnectedAccount savedAccount = connectedAccountRepository.save(connectedAccount);

        return ConnectProviderResponseDTO.builder()
                .connection(toDto(savedAccount))
                .authorizationUrl(null)
                .state(null)
                .build();
    }

    @Override
    @Transactional
    public DisconnectProviderResponseDTO disconnectProvider(UUID profileId, String provider) {

        String normalize = normalizeProvider(provider);

        ConnectedAccount connectedAccount = connectedAccountRepository
                .findByProfileIdAndProvider(profileId, normalize)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Connected account with profile and provider not found"));

        // Null/default fill in the fields
        connectedAccount.setStatus(STATUS_DISCONNECTED);
        connectedAccount.setProviderUserId(null);
        connectedAccount.setScopes(new String[0]);
        connectedAccount.setAccessTokenEncrypted(null);
        connectedAccount.setRefreshTokenEncrypted(null);
        connectedAccount.setAccessTokenExpiresAt(null);
        connectedAccount.setRefreshTokenExpiresAt(null);
        connectedAccount.setLastSyncedAt(null);
        connectedAccount.setUpdatedAt(OffsetDateTime.now());

        ConnectedAccount saved = connectedAccountRepository.save(connectedAccount);

        return DisconnectProviderResponseDTO.builder()
                .connection(toDto(saved))
                .build();
    }

    @Override
    public List<ConnectedAccountDTO> getConnections(UUID profileId) {
        return connectedAccountRepository.findByProfileIdOrderByCreatedAtDesc(profileId).stream()
                .map(this::toDto)
                .toList();
    }


    /**
     * Normalize a string to the provider
     * Throw error if no provider is found
     * @param provider - String to normalize
     * @return a String representing normalized string
     */
    private String normalizeProvider(String provider) {
        if (provider == null || provider.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "provider is required");

        String normalized = provider.trim().toLowerCase(Locale.ROOT);

        if (!SUPPORTED_PROVIDERS.contains(normalized))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported provider: " + normalized);

        return normalized;
    }

    private ConnectedAccountDTO toDto(ConnectedAccount account) {
        return ConnectedAccountDTO.builder()
                .id(account.getId())
                .profileId(account.getProfile().getId())
                .provider(account.getProvider())
                .providerUserId(account.getProviderUserId())
                .status(account.getStatus())
                .scopes(account.getScopes() == null ? List.of() : Arrays.asList(account.getScopes()))
                .lastSyncedAt(account.getLastSyncedAt())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }
}
