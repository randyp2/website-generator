package com.webgen.webgen_backend.verification.service.provider.github;

import com.webgen.webgen_backend.verification.service.provider.github.model.GithubTokenResponse;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.isBlank;

@Component
public class GithubTokenRefreshClient {

    private static final String GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

    private final RestTemplate restTemplate = new RestTemplate();

    public GithubTokenResponse refreshAccessToken(
            String clientId,
            String clientSecret,
            String refreshToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("client_id", clientId);
        formData.add("client_secret", clientSecret);
        formData.add("grant_type", "refresh_token");
        formData.add("refresh_token", refreshToken);

        try {
            ResponseEntity<GithubTokenResponse> response = restTemplate.exchange(
                    GITHUB_TOKEN_URL,
                    HttpMethod.POST,
                    new HttpEntity<>(formData, headers),
                    GithubTokenResponse.class);

            GithubTokenResponse body = response.getBody();
            if (body == null || isBlank(body.accessToken())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "GitHub token refresh returned empty access token");
            }

            if (!isBlank(body.error())) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "GitHub token refresh failed: " + body.error());
            }

            return body;
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode() == HttpStatus.BAD_REQUEST
                    || exception.getStatusCode() == HttpStatus.UNAUTHORIZED
                    || exception.getStatusCode() == HttpStatus.FORBIDDEN) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "GitHub token refresh failed. Reconnect is required.",
                        exception);
            }

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "GitHub token refresh request failed",
                    exception);
        } catch (RestClientException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "GitHub token refresh request failed",
                    exception);
        }
    }
}
