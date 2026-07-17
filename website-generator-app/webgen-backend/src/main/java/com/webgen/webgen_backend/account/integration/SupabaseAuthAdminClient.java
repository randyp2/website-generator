package com.webgen.webgen_backend.account.integration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.UUID;

import static com.webgen.webgen_backend.shared.integration.SupabaseAdminRequestHeaders.create;
import static org.springframework.http.HttpStatus.BAD_GATEWAY;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

/**
 * Minimal server-only client for permanent Supabase Auth user deletion.
 */
@Component
public class SupabaseAuthAdminClient {

    private final RestTemplate restTemplate;
    private final String projectUrl;
    private final String serviceRoleKey;

    @Autowired
    public SupabaseAuthAdminClient(
            @Value("${supabase.project.url}") String projectUrl,
            @Value("${supabase.service-role-key}") String serviceRoleKey
    ) {
        this(new RestTemplate(), projectUrl, serviceRoleKey);
    }

    protected SupabaseAuthAdminClient(
            RestTemplate restTemplate,
            String projectUrl,
            String serviceRoleKey
    ) {
        this.restTemplate = restTemplate;
        this.projectUrl = trimTrailingSlash(projectUrl);
        this.serviceRoleKey = serviceRoleKey;
    }

    /** Permanently removes a Supabase Auth user. Missing users are already deleted. */
    public void deleteUser(UUID profileId) {
        if (profileId == null) {
            throw new ResponseStatusException(BAD_REQUEST, "profileId is required");
        }
        validateConfiguration();

        URI uri = UriComponentsBuilder.fromUriString(projectUrl)
                .pathSegment("auth", "v1", "admin", "users", profileId.toString())
                .build()
                .encode()
                .toUri();
        HttpEntity<Void> request = new HttpEntity<>(adminHeaders());

        try {
            restTemplate.exchange(uri, HttpMethod.DELETE, request, Void.class);
        } catch (HttpStatusCodeException exception) {
            if (exception.getStatusCode().value() == 404) {
                return;
            }
            throw authFailure(exception);
        } catch (RestClientException exception) {
            throw authFailure(exception);
        }
    }

    private HttpHeaders adminHeaders() {
        return create(serviceRoleKey);
    }

    private void validateConfiguration() {
        if (!StringUtils.hasText(projectUrl) || !StringUtils.hasText(serviceRoleKey)) {
            throw new ResponseStatusException(
                    INTERNAL_SERVER_ERROR,
                    "Supabase Auth administration is not configured"
            );
        }
    }

    private String trimTrailingSlash(String value) {
        if (value == null) {
            return null;
        }
        return value.trim().replaceAll("/+$", "");
    }

    private ResponseStatusException authFailure(Exception cause) {
        return new ResponseStatusException(
                BAD_GATEWAY,
                "Unable to delete Supabase Auth user",
                cause
        );
    }
}
