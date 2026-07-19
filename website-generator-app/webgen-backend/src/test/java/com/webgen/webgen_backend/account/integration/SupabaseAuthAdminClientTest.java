package com.webgen.webgen_backend.account.integration;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.http.HttpStatus.BAD_GATEWAY;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.headerDoesNotExist;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withNoContent;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;

class SupabaseAuthAdminClientTest {

    private static final String PROJECT_URL = "https://example.supabase.co";
    private static final String SERVICE_ROLE_KEY = "sb_secret_server-key";

    @Test
    void permanentlyDeletesUserWithServerCredentials() {
        UUID profileId = UUID.randomUUID();
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        SupabaseAuthAdminClient client = new SupabaseAuthAdminClient(
                restTemplate,
                PROJECT_URL,
                SERVICE_ROLE_KEY
        );
        server.expect(once(), requestTo(
                        PROJECT_URL + "/auth/v1/admin/users/" + profileId
                ))
                .andExpect(method(HttpMethod.DELETE))
                .andExpect(header("apikey", SERVICE_ROLE_KEY))
                .andExpect(headerDoesNotExist(HttpHeaders.AUTHORIZATION))
                .andRespond(withNoContent());

        client.deleteUser(profileId);

        server.verify();
    }

    @Test
    void supportsLegacyJwtServiceRoleKeys() {
        UUID profileId = UUID.randomUUID();
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        String legacyServiceRoleKey = "legacy-jwt-service-role-key";
        SupabaseAuthAdminClient client = new SupabaseAuthAdminClient(
                restTemplate,
                PROJECT_URL,
                legacyServiceRoleKey
        );
        server.expect(once(), requestTo(
                        PROJECT_URL + "/auth/v1/admin/users/" + profileId
                ))
                .andExpect(header("apikey", legacyServiceRoleKey))
                .andExpect(header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + legacyServiceRoleKey
                ))
                .andRespond(withNoContent());

        client.deleteUser(profileId);

        server.verify();
    }

    @Test
    void missingAuthUserIsAnIdempotentSuccess() {
        UUID profileId = UUID.randomUUID();
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        SupabaseAuthAdminClient client = new SupabaseAuthAdminClient(
                restTemplate,
                PROJECT_URL,
                SERVICE_ROLE_KEY
        );
        server.expect(once(), requestTo(
                        PROJECT_URL + "/auth/v1/admin/users/" + profileId
                ))
                .andRespond(withStatus(org.springframework.http.HttpStatus.NOT_FOUND));

        assertThatCode(() -> client.deleteUser(profileId)).doesNotThrowAnyException();
        server.verify();
    }

    @Test
    void providerFailureRemainsRetryable() {
        UUID profileId = UUID.randomUUID();
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        SupabaseAuthAdminClient client = new SupabaseAuthAdminClient(
                restTemplate,
                PROJECT_URL,
                SERVICE_ROLE_KEY
        );
        server.expect(once(), requestTo(
                        PROJECT_URL + "/auth/v1/admin/users/" + profileId
                ))
                .andRespond(withServerError());

        assertThatThrownBy(() -> client.deleteUser(profileId))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(BAD_GATEWAY)
                );
        server.verify();
    }

    @Test
    void rejectsMissingServerConfiguration() {
        SupabaseAuthAdminClient client = new SupabaseAuthAdminClient(
                new RestTemplate(),
                " ",
                " "
        );

        assertThatThrownBy(() -> client.deleteUser(UUID.randomUUID()))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode())
                                .isEqualTo(INTERNAL_SERVER_ERROR)
                );
    }
}
