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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Base64;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

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
    private static final String GITHUB_PROVIDER = "github";
    private static final String GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
    private static final long DEFAULT_STATE_TTL_SECONDS = 600L;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Value("${github.oauth.client-id:}")
    private String githubOauthClientId;

    @Value("${github.oauth.redirect-uri:}")
    private String githubOauthRedirectUri;

    @Value("${github.oauth.scopes:read:user,user:email}")
    private String githubOauthScopes;

    @Value("${github.oauth.state-ttl-seconds:600}")
    private long githubOauthStateTtlSeconds;

    @Override
    @Transactional
    public ConnectProviderResponseDTO connectProvider(UUID profileId, String provider) {

        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

        String normalizedProvider = normalizeProvider(provider);

        OffsetDateTime now = OffsetDateTime.now();

        ConnectedAccount connectedAccount = connectedAccountRepository
                .findByProfileIdAndProvider(profileId, normalizedProvider)
                .orElseGet(() -> {
                    ConnectedAccount account = new ConnectedAccount();
                    account.setId(UUID.randomUUID());
                    account.setProfile(profile);
                    account.setProvider(normalizedProvider);
                    account.setScopes(new String[0]); // No scopes upon connecting
                    account.setCreatedAt(now);
                    account.setUpdatedAt(now);

                    return account;
                });

        // Ensure data in consistent
        connectedAccount.setProfile(profile);
        connectedAccount.setProvider(normalizedProvider);
        connectedAccount.setStatus(STATUS_PENDING);
        if (connectedAccount.getScopes() == null)
            connectedAccount.setScopes(new String[0]);
        connectedAccount.setUpdatedAt(now);

        // --- Resolve oauth based on provider
        String oauthState = null;
        String authorizationUrl = null;
        if (GITHUB_PROVIDER.equals(normalizedProvider)) {
            validateGithubOauthConfiguration();
            oauthState = generateOauthState();
            authorizationUrl = buildGithubAuthorizationUrl(oauthState);
            connectedAccount.setOauthState(oauthState);
            connectedAccount.setOauthStateExpiresAt(
                    now.plusSeconds(resolveStateTtlSeconds())
            );
        } else {
            connectedAccount.setOauthState(null);
            connectedAccount.setOauthStateExpiresAt(null);
        }

        ConnectedAccount savedAccount = connectedAccountRepository.save(connectedAccount);

        return ConnectProviderResponseDTO.builder()
                .connection(toDto(savedAccount))
                .authorizationUrl(authorizationUrl)
                .state(oauthState)
                .build();
    }

    @Override
    @Transactional
    public DisconnectProviderResponseDTO disconnectProvider(UUID profileId, String provider) {

        String normalizedProvider = normalizeProvider(provider);

        ConnectedAccount connectedAccount = connectedAccountRepository
                .findByProfileIdAndProvider(profileId, normalizedProvider)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Connected account with profile and provider not found"));

        // Null/default fill in the fields
        connectedAccount.setStatus(STATUS_DISCONNECTED);
        connectedAccount.setProviderUserId(null);
        connectedAccount.setScopes(new String[0]);
        connectedAccount.setAccessTokenEncrypted(null);
        connectedAccount.setRefreshTokenEncrypted(null);
        connectedAccount.setAccessTokenExpiresAt(null);
        connectedAccount.setRefreshTokenExpiresAt(null);
        connectedAccount.setOauthState(null);
        connectedAccount.setOauthStateExpiresAt(null);
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

    /** Fail fast if the minimal GitHub OAuth configuration is missing.*/
    private void validateGithubOauthConfiguration() {

        if (githubOauthClientId == null || githubOauthClientId.isBlank()
                || githubOauthRedirectUri == null || githubOauthRedirectUri.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "GitHub OAuth is not configured"
            );
        }
    }

    /** Build the provider authorization URL that the frontend redirects the user to.*/
    private String buildGithubAuthorizationUrl(String state) {
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(GITHUB_AUTHORIZE_URL)
                .queryParam("client_id", githubOauthClientId)
                .queryParam("redirect_uri", githubOauthRedirectUri)
                .queryParam("state", state);

        String scopeParam = normalizeScopeParam(githubOauthScopes);
        if (!scopeParam.isBlank()) {
            builder.queryParam("scope", scopeParam);
        }

        // Encode query params (notably space-delimited scopes) into a valid URL.
        return builder.build().encode().toUriString();
    }

    /** Generate a cryptographically secure, URL-safe CSRF state token. */
    private String generateOauthState() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /** Enforce a safe default if TTL is misconfigured or non-positive. */
    private long resolveStateTtlSeconds() {
        return githubOauthStateTtlSeconds > 0
                ? githubOauthStateTtlSeconds
                : DEFAULT_STATE_TTL_SECONDS;
    }

    /** Normalize scopes into a deduplicated, space-delimited OAuth scope string. */
    private String normalizeScopeParam(String scopesConfig) {
        if (scopesConfig == null || scopesConfig.isBlank())
            return "";

        return Arrays.stream(scopesConfig.split("[,\\s]+"))
                .map(String::trim)
                .filter(scope -> !scope.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new))
                .stream()
                .collect(Collectors.joining(" "));
    }

    /** Map persistence model to the API-safe connected account response DTO */
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
