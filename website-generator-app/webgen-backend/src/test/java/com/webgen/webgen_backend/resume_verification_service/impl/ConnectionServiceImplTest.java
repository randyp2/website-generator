package com.webgen.webgen_backend.resume_verification_service.impl;

import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import com.webgen.webgen_backend.verification.dto.connection.ConnectProviderResponseDTO;
import com.webgen.webgen_backend.verification.dto.connection.ConnectedAccountDTO;
import com.webgen.webgen_backend.verification.dto.connection.DisconnectProviderResponseDTO;
import com.webgen.webgen_backend.verification.entity.ConnectedAccount;
import com.webgen.webgen_backend.verification.mapper.ConnectedAccountMapper;
import com.webgen.webgen_backend.verification.repository.ConnectedAccountRepository;
import com.webgen.webgen_backend.verification.service.impl.ConnectionServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Field;
import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ConnectionServiceImplTest {

    // ─── connectProvider validation ──────────────────────────────────────────

    @Test
    void connectThrowsForUnsupportedProvider() {
        ConnectionServiceImpl service = buildService(
                profileRepo(Optional.of(profile(UUID.randomUUID()))),
                accountRepo(Optional.empty()),
                passThroughMapper()
        );

        assertThatThrownBy(() -> service.connectProvider(UUID.randomUUID(), "twitter"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void connectThrowsForBlankProvider() {
        ConnectionServiceImpl service = buildService(
                profileRepo(Optional.of(profile(UUID.randomUUID()))),
                accountRepo(Optional.empty()),
                passThroughMapper()
        );

        assertThatThrownBy(() -> service.connectProvider(UUID.randomUUID(), ""))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void connectThrowsNotFoundWhenProfileMissing() {
        ConnectionServiceImpl service = buildService(
                profileRepo(Optional.empty()),
                accountRepo(Optional.empty()),
                passThroughMapper()
        );

        assertThatThrownBy(() -> service.connectProvider(UUID.randomUUID(), "github"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    // ─── connectProvider GitHub ──────────────────────────────────────────────

    @Test
    void connectGithubThrowsWhenOAuthConfigMissing() throws Exception {
        UUID profileId = UUID.randomUUID();
        ConnectionServiceImpl service = buildConfiguredService(
                profileRepo(Optional.of(profile(profileId))),
                accountRepo(Optional.empty()),
                passThroughMapper(),
                "",
                "https://example.com/callback"
        );

        assertThatThrownBy(() -> service.connectProvider(profileId, "github"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    void connectGithubThrowsWhenRedirectUriMissing() throws Exception {
        UUID profileId = UUID.randomUUID();
        ConnectionServiceImpl service = buildConfiguredService(
                profileRepo(Optional.of(profile(profileId))),
                accountRepo(Optional.empty()),
                passThroughMapper(),
                "client-123",
                ""
        );

        assertThatThrownBy(() -> service.connectProvider(profileId, "github"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    void connectGithubGeneratesStateAndAuthorizationUrl() throws Exception {
        UUID profileId = UUID.randomUUID();
        AtomicReference<ConnectedAccount> savedAccount = new AtomicReference<>();

        ConnectedAccountRepository repo = (ConnectedAccountRepository) Proxy.newProxyInstance(
                ConnectedAccountRepository.class.getClassLoader(),
                new Class[]{ConnectedAccountRepository.class},
                (proxy, method, args) -> {
                    if ("findByProfileIdAndProvider".equals(method.getName())) return Optional.empty();
                    if ("save".equals(method.getName())) {
                        savedAccount.set((ConnectedAccount) args[0]);
                        return args[0];
                    }
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );

        ConnectionServiceImpl service = buildConfiguredService(
                profileRepo(Optional.of(profile(profileId))),
                repo,
                passThroughMapper(),
                "test-client-id",
                "https://example.com/callback"
        );

        ConnectProviderResponseDTO result = service.connectProvider(profileId, "github");

        assertThat(result.getState()).isNotNull().isNotBlank();
        assertThat(result.getAuthorizationUrl())
                .startsWith("https://github.com/login/oauth/authorize")
                .contains("client_id=test-client-id")
                .contains("redirect_uri=")
                .contains("state=");
        assertThat(savedAccount.get().getStatus()).isEqualTo("pending");
        assertThat(savedAccount.get().getOauthState()).isEqualTo(result.getState());
        assertThat(savedAccount.get().getOauthStateExpiresAt()).isNotNull();
    }

    @Test
    void connectGithubOauthStateLengthIsCorrect() throws Exception {
        UUID profileId = UUID.randomUUID();

        ConnectionServiceImpl service = buildConfiguredService(
                profileRepo(Optional.of(profile(profileId))),
                accountRepo(Optional.empty()),
                passThroughMapper(),
                "test-client-id",
                "https://example.com/callback"
        );

        ConnectProviderResponseDTO result = service.connectProvider(profileId, "github");

        // 32 random bytes base64url-encoded without padding = 43 characters
        assertThat(result.getState()).hasSize(43);
    }

    @Test
    void connectNonGithubProviderSetsNullOauthState() throws Exception {
        UUID profileId = UUID.randomUUID();
        AtomicReference<ConnectedAccount> savedAccount = new AtomicReference<>();

        ConnectedAccountRepository repo = (ConnectedAccountRepository) Proxy.newProxyInstance(
                ConnectedAccountRepository.class.getClassLoader(),
                new Class[]{ConnectedAccountRepository.class},
                (proxy, method, args) -> {
                    if ("findByProfileIdAndProvider".equals(method.getName())) return Optional.empty();
                    if ("save".equals(method.getName())) {
                        savedAccount.set((ConnectedAccount) args[0]);
                        return args[0];
                    }
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );

        ConnectionServiceImpl service = buildService(
                profileRepo(Optional.of(profile(profileId))), repo, passThroughMapper()
        );

        ConnectProviderResponseDTO result = service.connectProvider(profileId, "website");

        assertThat(result.getState()).isNull();
        assertThat(result.getAuthorizationUrl()).isNull();
        assertThat(savedAccount.get().getOauthState()).isNull();
        assertThat(savedAccount.get().getStatus()).isEqualTo("pending");
    }

    // ─── disconnectProvider ───────────────────────────────────────────────────

    @Test
    void disconnectThrowsNotFoundWhenProfileMissing() {
        ConnectionServiceImpl service = buildService(
                profileRepo(Optional.empty()),
                accountRepo(Optional.empty()),
                passThroughMapper()
        );

        assertThatThrownBy(() -> service.disconnectProvider(UUID.randomUUID(), "github"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void disconnectThrowsNotFoundWhenAccountMissing() {
        UUID profileId = UUID.randomUUID();
        ConnectionServiceImpl service = buildService(
                profileRepo(Optional.of(profile(profileId))),
                accountRepo(Optional.empty()),
                passThroughMapper()
        );

        assertThatThrownBy(() -> service.disconnectProvider(profileId, "github"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void disconnectIsIdempotentWhenAlreadyFullySanitized() {
        UUID profileId = UUID.randomUUID();
        ConnectedAccount alreadyDisconnected = buildDisconnectedAccount(profileId, "github");
        AtomicBoolean saveCalled = new AtomicBoolean(false);

        ConnectedAccountRepository repo = (ConnectedAccountRepository) Proxy.newProxyInstance(
                ConnectedAccountRepository.class.getClassLoader(),
                new Class[]{ConnectedAccountRepository.class},
                (proxy, method, args) -> {
                    if ("findByProfileIdAndProvider".equals(method.getName()))
                        return Optional.of(alreadyDisconnected);
                    if ("findById".equals(method.getName()))
                        return Optional.of(alreadyDisconnected);
                    if ("save".equals(method.getName())) {
                        saveCalled.set(true);
                        return args[0];
                    }
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );

        ConnectionServiceImpl service = buildService(
                profileRepo(Optional.of(profile(profileId))),
                repo,
                passThroughMapper()
        );

        DisconnectProviderResponseDTO result = service.disconnectProvider(profileId, "github");

        assertThat(saveCalled.get()).isFalse();
        assertThat(result.getConnection()).isNotNull();
    }

    @Test
    void disconnectClearsAllSensitiveFieldsOnConnectedAccount() {
        UUID profileId = UUID.randomUUID();
        ConnectedAccount connected = buildConnectedAccount(profileId, "github");
        AtomicReference<ConnectedAccount> savedAccount = new AtomicReference<>();

        ConnectedAccountRepository repo = (ConnectedAccountRepository) Proxy.newProxyInstance(
                ConnectedAccountRepository.class.getClassLoader(),
                new Class[]{ConnectedAccountRepository.class},
                (proxy, method, args) -> {
                    if ("findByProfileIdAndProvider".equals(method.getName()))
                        return Optional.of(connected);
                    if ("findById".equals(method.getName()))
                        return Optional.of(connected);
                    if ("save".equals(method.getName())) {
                        savedAccount.set((ConnectedAccount) args[0]);
                        return args[0];
                    }
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );

        ConnectionServiceImpl service = buildService(
                profileRepo(Optional.of(profile(profileId))),
                repo,
                passThroughMapper()
        );

        service.disconnectProvider(profileId, "github");

        ConnectedAccount saved = savedAccount.get();
        assertThat(saved.getStatus()).isEqualTo("disconnected");
        assertThat(saved.getProviderUserId()).isNull();
        assertThat(saved.getAccessTokenEncrypted()).isNull();
        assertThat(saved.getRefreshTokenEncrypted()).isNull();
        assertThat(saved.getOauthState()).isNull();
        assertThat(saved.getOauthStateExpiresAt()).isNull();
        assertThat(saved.getLastSyncedAt()).isNull();
    }

    // ─── getConnections ───────────────────────────────────────────────────────

    @Test
    void getConnectionsReturnsEmptyListWhenNoneExist() {
        UUID profileId = UUID.randomUUID();

        ConnectedAccountRepository repo = (ConnectedAccountRepository) Proxy.newProxyInstance(
                ConnectedAccountRepository.class.getClassLoader(),
                new Class[]{ConnectedAccountRepository.class},
                (proxy, method, args) -> {
                    if ("findByProfileIdOrderByCreatedAtDesc".equals(method.getName())) return List.of();
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );

        ConnectionServiceImpl service = buildService(
                profileRepo(Optional.of(profile(profileId))), repo, passThroughMapper()
        );

        assertThat(service.getConnections(profileId)).isEmpty();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private ConnectionServiceImpl buildService(
            ProfileRepository profileRepo,
            ConnectedAccountRepository accountRepo,
            ConnectedAccountMapper mapper
    ) {
        return new ConnectionServiceImpl(accountRepo, profileRepo, mapper);
    }

    private ConnectionServiceImpl buildConfiguredService(
            ProfileRepository profileRepo,
            ConnectedAccountRepository accountRepo,
            ConnectedAccountMapper mapper,
            String clientId,
            String redirectUri
    ) throws Exception {
        ConnectionServiceImpl service = new ConnectionServiceImpl(accountRepo, profileRepo, mapper);
        setField(service, "githubOauthClientId", clientId);
        setField(service, "githubOauthRedirectUri", redirectUri);
        setField(service, "githubOauthScopes", "read:user,repo");
        setField(service, "githubOauthStateTtlSeconds", 600L);
        return service;
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }

    @SuppressWarnings("unchecked")
    private ProfileRepository profileRepo(Optional<Profile> result) {
        return (ProfileRepository) Proxy.newProxyInstance(
                ProfileRepository.class.getClassLoader(),
                new Class[]{ProfileRepository.class},
                (proxy, method, args) -> {
                    if ("findById".equals(method.getName())) return result;
                    if ("save".equals(method.getName())) return args[0];
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );
    }

    @SuppressWarnings("unchecked")
    private ConnectedAccountRepository accountRepo(Optional<ConnectedAccount> result) {
        return (ConnectedAccountRepository) Proxy.newProxyInstance(
                ConnectedAccountRepository.class.getClassLoader(),
                new Class[]{ConnectedAccountRepository.class},
                (proxy, method, args) -> {
                    if ("findByProfileIdAndProvider".equals(method.getName())) return result;
                    if ("save".equals(method.getName())) return args[0];
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );
    }

    @SuppressWarnings("unchecked")
    private ConnectedAccountMapper passThroughMapper() {
        return (ConnectedAccountMapper) Proxy.newProxyInstance(
                ConnectedAccountMapper.class.getClassLoader(),
                new Class[]{ConnectedAccountMapper.class},
                (proxy, method, args) -> {
                    if ("toDto".equals(method.getName())) {
                        ConnectedAccount account = (ConnectedAccount) args[0];
                        return ConnectedAccountDTO.builder()
                                .id(account.getId())
                                .provider(account.getProvider())
                                .status(account.getStatus())
                                .scopes(List.of())
                                .build();
                    }
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );
    }

    private Object handleObjectMethod(Object proxy, String methodName, Object[] args) {
        return switch (methodName) {
            case "toString" -> "proxy";
            case "hashCode" -> System.identityHashCode(proxy);
            case "equals" -> proxy == args[0];
            default -> throw new UnsupportedOperationException("Unexpected method: " + methodName);
        };
    }

    private Profile profile(UUID id) {
        Profile p = new Profile();
        p.setId(id);
        return p;
    }

    private ConnectedAccount buildConnectedAccount(UUID profileId, String provider) {
        Profile profile = new Profile();
        profile.setId(profileId);
        ConnectedAccount account = new ConnectedAccount();
        account.setId(UUID.randomUUID());
        account.setProfile(profile);
        account.setProvider(provider);
        account.setStatus("connected");
        account.setProviderUserId("gh-123");
        account.setScopes(new String[]{"read:user"});
        account.setAccessTokenEncrypted("encrypted-access-token");
        account.setRefreshTokenEncrypted("encrypted-refresh-token");
        account.setOauthState("some-state");
        account.setOauthStateExpiresAt(OffsetDateTime.now().plusMinutes(5));
        account.setLastSyncedAt(OffsetDateTime.now().minusDays(1));
        account.setLastSyncStatus("success");
        account.setLastSyncImportedCount(10);
        account.setLastSyncLinkedCount(5);
        account.setCreatedAt(OffsetDateTime.parse("2026-01-01T00:00:00Z"));
        account.setUpdatedAt(OffsetDateTime.parse("2026-01-01T00:00:00Z"));
        return account;
    }

    private ConnectedAccount buildDisconnectedAccount(UUID profileId, String provider) {
        Profile profile = new Profile();
        profile.setId(profileId);
        ConnectedAccount account = new ConnectedAccount();
        account.setId(UUID.randomUUID());
        account.setProfile(profile);
        account.setProvider(provider);
        account.setStatus("disconnected");
        account.setProviderUserId(null);
        account.setScopes(new String[0]);
        account.setAccessTokenEncrypted(null);
        account.setRefreshTokenEncrypted(null);
        account.setAccessTokenExpiresAt(null);
        account.setRefreshTokenExpiresAt(null);
        account.setOauthState(null);
        account.setOauthStateExpiresAt(null);
        account.setLastSyncedAt(null);
        account.setLastSyncStatus("never");
        account.setLastSyncImportedCount(0);
        account.setLastSyncLinkedCount(0);
        account.setCreatedAt(OffsetDateTime.parse("2026-01-01T00:00:00Z"));
        account.setUpdatedAt(OffsetDateTime.parse("2026-01-01T00:00:00Z"));
        return account;
    }
}
