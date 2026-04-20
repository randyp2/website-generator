package com.webgen.webgen_backend.resume_verification_service.impl;

import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.verification.dto.connection.ConnectedAccountDTO;
import com.webgen.webgen_backend.verification.dto.connection.ProviderCallbackRequestDTO;
import com.webgen.webgen_backend.verification.entity.ConnectedAccount;
import com.webgen.webgen_backend.verification.mapper.ConnectedAccountMapper;
import com.webgen.webgen_backend.verification.repository.ConnectedAccountRepository;
import com.webgen.webgen_backend.verification.service.impl.ProviderOAuthCallbackServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Field;
import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ProviderOAuthCallbackServiceImplTest {

    // ─── Request validation ───────────────────────────────────────────────────

    @Test
    void rejectsUnsupportedProvider() throws Exception {
        ProviderOAuthCallbackServiceImpl service = buildConfiguredService(
                accountRepo(Optional.empty()), passThroughMapper()
        );

        ProviderCallbackRequestDTO req = validRequest();

        assertThatThrownBy(() -> service.handleProviderCallback(UUID.randomUUID(), "linkedin", req))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void rejectsNullRequest() throws Exception {
        ProviderOAuthCallbackServiceImpl service = buildConfiguredService(
                accountRepo(Optional.empty()), passThroughMapper()
        );

        assertThatThrownBy(() -> service.handleProviderCallback(UUID.randomUUID(), "github", null))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void rejectsBlankCode() throws Exception {
        ProviderOAuthCallbackServiceImpl service = buildConfiguredService(
                accountRepo(Optional.empty()), passThroughMapper()
        );

        ProviderCallbackRequestDTO req = ProviderCallbackRequestDTO.builder()
                .code("")
                .state("some-state")
                .build();

        assertThatThrownBy(() -> service.handleProviderCallback(UUID.randomUUID(), "github", req))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void rejectsBlankState() throws Exception {
        ProviderOAuthCallbackServiceImpl service = buildConfiguredService(
                accountRepo(Optional.empty()), passThroughMapper()
        );

        ProviderCallbackRequestDTO req = ProviderCallbackRequestDTO.builder()
                .code("auth-code-abc")
                .state("")
                .build();

        assertThatThrownBy(() -> service.handleProviderCallback(UUID.randomUUID(), "github", req))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    // ─── OAuth config validation ──────────────────────────────────────────────

    @Test
    void rejectsMissingOAuthConfig() throws Exception {
        ProviderOAuthCallbackServiceImpl service = buildService(
                accountRepo(Optional.empty()), passThroughMapper()
        );

        assertThatThrownBy(() -> service.handleProviderCallback(UUID.randomUUID(), "github", validRequest()))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // ─── Account lookup ───────────────────────────────────────────────────────

    @Test
    void rejectsWhenAccountNotFound() throws Exception {
        ProviderOAuthCallbackServiceImpl service = buildConfiguredService(
                accountRepo(Optional.empty()), passThroughMapper()
        );

        assertThatThrownBy(() -> service.handleProviderCallback(UUID.randomUUID(), "github", validRequest()))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    // ─── OAuth state validation ───────────────────────────────────────────────

    @Test
    void rejectsWhenNoPendingOAuthState() throws Exception {
        UUID profileId = UUID.randomUUID();
        ConnectedAccount account = buildAccountWithState(profileId, null, null);

        ProviderOAuthCallbackServiceImpl service = buildConfiguredService(
                accountRepo(Optional.of(account)), passThroughMapper()
        );

        assertThatThrownBy(() -> service.handleProviderCallback(profileId, "github", validRequest()))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> {
                    ResponseStatusException ex = (ResponseStatusException) e;
                    assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(ex.getReason()).contains("pending OAuth state");
                });
    }

    @Test
    void rejectsExpiredOauthState() throws Exception {
        UUID profileId = UUID.randomUUID();
        OffsetDateTime expiredAt = OffsetDateTime.now().minusSeconds(1);
        ConnectedAccount account = buildAccountWithState(profileId, "some-state", expiredAt);

        ProviderCallbackRequestDTO req = ProviderCallbackRequestDTO.builder()
                .code("auth-code")
                .state("some-state")
                .build();

        ProviderOAuthCallbackServiceImpl service = buildConfiguredService(
                accountRepo(Optional.of(account)), passThroughMapper()
        );

        assertThatThrownBy(() -> service.handleProviderCallback(profileId, "github", req))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> {
                    ResponseStatusException ex = (ResponseStatusException) e;
                    assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(ex.getReason()).contains("expired");
                });
    }

    @Test
    void rejectsStateMismatch() throws Exception {
        UUID profileId = UUID.randomUUID();
        OffsetDateTime validExpiry = OffsetDateTime.now().plusMinutes(5);
        ConnectedAccount account = buildAccountWithState(profileId, "stored-state-abc", validExpiry);

        ProviderCallbackRequestDTO req = ProviderCallbackRequestDTO.builder()
                .code("auth-code")
                .state("different-state-xyz")
                .build();

        ProviderOAuthCallbackServiceImpl service = buildConfiguredService(
                accountRepo(Optional.of(account)), passThroughMapper()
        );

        assertThatThrownBy(() -> service.handleProviderCallback(profileId, "github", req))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> {
                    ResponseStatusException ex = (ResponseStatusException) e;
                    assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(ex.getReason()).contains("mismatch");
                });
    }

    @Test
    void acceptsValidNonExpiredMatchingState() throws Exception {
        UUID profileId = UUID.randomUUID();
        String state = "matching-state";
        OffsetDateTime validExpiry = OffsetDateTime.now().plusMinutes(10);
        ConnectedAccount account = buildAccountWithState(profileId, state, validExpiry);

        ProviderCallbackRequestDTO req = ProviderCallbackRequestDTO.builder()
                .code("auth-code")
                .state(state)
                .build();

        ProviderOAuthCallbackServiceImpl service = buildConfiguredService(
                accountRepo(Optional.of(account)), passThroughMapper()
        );

        // State validation passes — the exception thrown here is BAD_GATEWAY from the
        // RestTemplate token exchange (no real GitHub server), not a state rejection.
        assertThatThrownBy(() -> service.handleProviderCallback(profileId, "github", req))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isNotIn(HttpStatus.CONFLICT, HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private ProviderOAuthCallbackServiceImpl buildService(
            ConnectedAccountRepository accountRepo,
            ConnectedAccountMapper mapper
    ) {
        return new ProviderOAuthCallbackServiceImpl(accountRepo, mapper);
    }

    private ProviderOAuthCallbackServiceImpl buildConfiguredService(
            ConnectedAccountRepository accountRepo,
            ConnectedAccountMapper mapper
    ) throws Exception {
        ProviderOAuthCallbackServiceImpl service = new ProviderOAuthCallbackServiceImpl(accountRepo, mapper);
        setField(service, "githubOauthClientId", "test-client-id");
        setField(service, "githubOauthClientSecret", "test-client-secret");
        setField(service, "githubOauthRedirectUri", "https://example.com/callback");
        setField(service, "githubOauthTokenEncryptionSecret", "test-encryption-secret-32chars!!");
        return service;
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
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

    private ProviderCallbackRequestDTO validRequest() {
        return ProviderCallbackRequestDTO.builder()
                .code("auth-code-abc")
                .state("some-state-xyz")
                .build();
    }

    private ConnectedAccount buildAccountWithState(
            UUID profileId,
            String oauthState,
            OffsetDateTime oauthStateExpiresAt
    ) {
        Profile profile = new Profile();
        profile.setId(profileId);
        ConnectedAccount account = new ConnectedAccount();
        account.setId(UUID.randomUUID());
        account.setProfile(profile);
        account.setProvider("github");
        account.setStatus("pending");
        account.setScopes(new String[0]);
        account.setOauthState(oauthState);
        account.setOauthStateExpiresAt(oauthStateExpiresAt);
        account.setLastSyncStatus("never");
        account.setLastSyncImportedCount(0);
        account.setLastSyncLinkedCount(0);
        account.setCreatedAt(OffsetDateTime.parse("2026-01-01T00:00:00Z"));
        account.setUpdatedAt(OffsetDateTime.parse("2026-01-01T00:00:00Z"));
        return account;
    }
}
