package com.webgen.webgen_backend.verification.service.impl;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.webgen.webgen_backend.verification.dto.connection.ProviderCallbackRequestDTO;
import com.webgen.webgen_backend.verification.dto.connection.ProviderCallbackResponseDTO;
import com.webgen.webgen_backend.verification.entity.ConnectedAccount;
import com.webgen.webgen_backend.verification.mapper.ConnectedAccountMapper;
import com.webgen.webgen_backend.verification.repository.ConnectedAccountRepository;
import com.webgen.webgen_backend.verification.service.ProviderOAuthCallbackService;
import com.webgen.webgen_backend.verification.service.shared.ProviderNormalizationHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProviderOAuthCallbackServiceImpl implements ProviderOAuthCallbackService {

    private static final Set<String> SUPPORTED_PROVIDERS = Set.of("github");
    private static final String STATUS_CONNECTED = "connected";
    private static final String GITHUB_PROVIDER = "github";
    private static final String GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
    private static final String GITHUB_USER_URL = "https://api.github.com/user";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final ConnectedAccountRepository connectedAccountRepository;
    private final ConnectedAccountMapper connectedAccountMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${github.oauth.client-id:}")
    private String githubOauthClientId;

    @Value("${github.oauth.client-secret:}")
    private String githubOauthClientSecret;

    @Value("${github.oauth.redirect-uri:}")
    private String githubOauthRedirectUri;

    @Value("${github.oauth.token-encryption-secret:}")
    private String githubOauthTokenEncryptionSecret;

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
        validateGithubOauthCallbackConfiguration(normalizedProvider);

        ConnectedAccount account = connectedAccountRepository
                .findByProfileIdAndProvider(profileId, normalizedProvider)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Connected account not found"
                ));

        OffsetDateTime now = OffsetDateTime.now();
        validateOauthState(account, req.getState(), now);

        GithubTokenResponse tokenResponse = exchangeGithubCodeForTokens(
                req.getCode(),
                req.getState()
        );
        String githubUserId = fetchGithubUserId(tokenResponse.accessToken());

        account.setStatus(STATUS_CONNECTED);
        account.setProviderUserId(githubUserId);
        account.setScopes(parseScopes(tokenResponse.scope()));
        account.setAccessTokenEncrypted(encryptToken(tokenResponse.accessToken()));
        account.setRefreshTokenEncrypted(
                encryptTokenOrNull(tokenResponse.refreshToken())
        );
        account.setAccessTokenExpiresAt(
                resolveExpiry(now, tokenResponse.expiresIn())
        );
        account.setRefreshTokenExpiresAt(
                resolveExpiry(now, tokenResponse.refreshTokenExpiresIn())
        );
        account.setOauthState(null);
        account.setOauthStateExpiresAt(null);
        account.setUpdatedAt(now);

        ConnectedAccount saved = connectedAccountRepository.save(account);
        log.info("Provider OAuth connected provider={} profileId={} accountId={}",
                normalizedProvider, profileId, saved.getId());
        return ProviderCallbackResponseDTO.builder()
                .connection(connectedAccountMapper.toDto(saved))
                .build();
    }

    // Validate callback configuration needed to complete OAuth token exchange.
    private void validateGithubOauthCallbackConfiguration(String normalizedProvider) {
        if (!GITHUB_PROVIDER.equals(normalizedProvider)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unsupported callback provider: " + normalizedProvider
            );
        }

        if (isBlank(githubOauthClientId)
                || isBlank(githubOauthClientSecret)
                || isBlank(githubOauthRedirectUri)
                || isBlank(githubOauthTokenEncryptionSecret)) {
            log.error("GitHub OAuth callback is misconfigured: required OAuth env values are missing");
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "GitHub OAuth callback is not configured"
            );
        }
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

    // Exchange GitHub authorization code for provider access token payload.
    private GithubTokenResponse exchangeGithubCodeForTokens(
            String code,
            String state
    ) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("client_id", githubOauthClientId);
        formData.add("client_secret", githubOauthClientSecret);
        formData.add("code", code);
        formData.add("redirect_uri", githubOauthRedirectUri);
        formData.add("state", state);

        try {
            ResponseEntity<GithubTokenResponse> response = restTemplate.exchange(
                    GITHUB_TOKEN_URL,
                    HttpMethod.POST,
                    new HttpEntity<>(formData, headers),
                    GithubTokenResponse.class
            );

            return getGithubTokenResponse(response);
        } catch (RestClientException exception) {
            log.error("GitHub token exchange request failed: {}", exception.getMessage(), exception);
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "GitHub token exchange request failed",
                    exception
            );
        }
    }

    // Validate the response access token
    private GithubTokenResponse getGithubTokenResponse(ResponseEntity<GithubTokenResponse> response) {
        GithubTokenResponse tokenResponse = response.getBody();
        if (tokenResponse == null || isBlank(tokenResponse.accessToken())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "GitHub token exchange returned empty access token"
            );
        }

        if (!isBlank(tokenResponse.error())) {
            log.warn("GitHub token exchange returned error={}", tokenResponse.error());
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "GitHub token exchange failed: " + tokenResponse.error()
            );
        }
        return tokenResponse;
    }

    // Resolve the authenticated GitHub user id to persist provider_user_id.
    private String fetchGithubUserId(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("X-GitHub-Api-Version", "2022-11-28");

        try {
            ResponseEntity<GithubUserResponse> response = restTemplate.exchange(
                    GITHUB_USER_URL,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    GithubUserResponse.class
            );

            GithubUserResponse githubUser = response.getBody();
            if (githubUser == null || githubUser.id() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "GitHub user lookup returned empty id"
                );
            }

            return String.valueOf(githubUser.id());
        } catch (RestClientException exception) {
            log.error("GitHub user lookup request failed: {}", exception.getMessage(), exception);
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "GitHub user lookup request failed",
                    exception
            );
        }
    }

    // Parse provider scope payload into normalized persistence array.
    private String[] parseScopes(String scopePayload) {
        if (isBlank(scopePayload)) {
            return new String[0];
        }

        return Arrays.stream(scopePayload.split("[,\\s]+"))
                .map(String::trim)
                .filter(scope -> !scope.isBlank())
                .distinct()
                .toArray(String[]::new);
    }

    // Encrypt token string before persistence to meet at-rest encryption requirements.
    private String encryptToken(String token) {
        try {
            byte[] iv = new byte[12];
            SECURE_RANDOM.nextBytes(iv);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec gcmSpec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.ENCRYPT_MODE, deriveEncryptionKey(), gcmSpec);

            byte[] encrypted = cipher.doFinal(token.getBytes(StandardCharsets.UTF_8));
            String ivEncoded = Base64.getEncoder().encodeToString(iv);
            String encryptedEncoded = Base64.getEncoder().encodeToString(encrypted);
            return ivEncoded + ":" + encryptedEncoded;
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to encrypt provider token",
                    exception
            );
        }
    }

    // Encrypt token only when value exists, otherwise keep nullable semantics.
    private String encryptTokenOrNull(String token) {
        if (isBlank(token)) {
            return null;
        }

        return encryptToken(token);
    }

    // Derive deterministic AES key material from configured encryption secret.
    private SecretKeySpec deriveEncryptionKey() throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] keyBytes = digest.digest(
                githubOauthTokenEncryptionSecret.getBytes(StandardCharsets.UTF_8)
        );
        return new SecretKeySpec(keyBytes, "AES");
    }

    // Convert optional provider expiry seconds into absolute timestamp.
    private OffsetDateTime resolveExpiry(OffsetDateTime now, Long expiresInSeconds) {
        if (expiresInSeconds == null || expiresInSeconds <= 0) {
            return null;
        }

        return now.plusSeconds(expiresInSeconds);
    }

    // Shared blank check to keep validation rules explicit and consistent.
    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record GithubTokenResponse(
            @JsonProperty("access_token")
            String accessToken,
            @JsonProperty("scope")
            String scope,
            @JsonProperty("refresh_token")
            String refreshToken,
            @JsonProperty("expires_in")
            Long expiresIn,
            @JsonProperty("refresh_token_expires_in")
            Long refreshTokenExpiresIn,
            @JsonProperty("error")
            String error
    ) {}

    private record GithubUserResponse(
            @JsonProperty("id")
            Long id
    ) {}
}
