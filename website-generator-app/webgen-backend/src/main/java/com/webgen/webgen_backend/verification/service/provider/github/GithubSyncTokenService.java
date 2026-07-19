package com.webgen.webgen_backend.verification.service.provider.github;

import com.webgen.webgen_backend.verification.entity.ConnectedAccount;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubSyncTokenResult;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubTokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Arrays;

import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.isBlank;

@Component
@RequiredArgsConstructor
public class GithubSyncTokenService {

    private static final String PROVIDER_GITHUB = "github";
    private static final long TOKEN_EXPIRY_SKEW_SECONDS = 60L;

    private final GithubTokenRefreshClient githubTokenRefreshClient;
    private final GithubTokenCipher githubTokenCipher;

    @Value("${github.oauth.client-id:}")
    private String githubOauthClientId;

    @Value("${github.oauth.client-secret:}")
    private String githubOauthClientSecret;

    public GithubSyncTokenResult ensureValidAccessToken(
            ConnectedAccount account,
            String provider,
            OffsetDateTime now) {
        if (!PROVIDER_GITHUB.equals(provider)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_IMPLEMENTED,
                    "Token flow is not implemented for provider: " + provider);
        }

        String accessToken = githubTokenCipher.decryptRequiredToken(
                account.getAccessTokenEncrypted(),
                "access token");

        if (!isExpiredWithSkew(account.getAccessTokenExpiresAt(), now)) {
            return new GithubSyncTokenResult(accessToken, false);
        }

        if (isExpiredWithSkew(account.getRefreshTokenExpiresAt(), now)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Provider refresh token is expired. Reconnect is required.");
        }

        validateGithubRefreshConfiguration();
        String refreshToken = githubTokenCipher.decryptRequiredToken(
                account.getRefreshTokenEncrypted(),
                "refresh token");

        GithubTokenResponse refreshed = githubTokenRefreshClient.refreshAccessToken(
                githubOauthClientId,
                githubOauthClientSecret,
                refreshToken);
        applyGithubRefreshResult(account, refreshed, now);

        return new GithubSyncTokenResult(refreshed.accessToken(), true);
    }

    private void applyGithubRefreshResult(
            ConnectedAccount account,
            GithubTokenResponse refreshed,
            OffsetDateTime now) {
        account.setAccessTokenEncrypted(githubTokenCipher.encryptToken(refreshed.accessToken()));
        if (!isBlank(refreshed.refreshToken())) {
            account.setRefreshTokenEncrypted(githubTokenCipher.encryptToken(refreshed.refreshToken()));
        }

        account.setAccessTokenExpiresAt(resolveExpiry(now, refreshed.expiresIn()));
        if (refreshed.refreshTokenExpiresIn() != null) {
            account.setRefreshTokenExpiresAt(
                    resolveExpiry(now, refreshed.refreshTokenExpiresIn()));
        }

        if (!isBlank(refreshed.scope())) {
            account.setScopes(parseScopes(refreshed.scope()));
        }
    }

    private void validateGithubRefreshConfiguration() {
        if (isBlank(githubOauthClientId) || isBlank(githubOauthClientSecret)) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "GitHub token refresh is not configured");
        }
    }

    private boolean isExpiredWithSkew(OffsetDateTime expiresAt, OffsetDateTime now) {
        if (expiresAt == null) {
            return false;
        }

        return !expiresAt.isAfter(now.plusSeconds(TOKEN_EXPIRY_SKEW_SECONDS));
    }

    private OffsetDateTime resolveExpiry(OffsetDateTime now, Long expiresInSeconds) {
        if (expiresInSeconds == null || expiresInSeconds <= 0) {
            return null;
        }
        return now.plusSeconds(expiresInSeconds);
    }

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
}
