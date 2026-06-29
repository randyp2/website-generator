package com.webgen.webgen_backend.verification.service.provider.github;

import com.fasterxml.jackson.databind.JsonNode;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubContentResponse;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubPathEntry;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubRepoResponse;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubUserResponse;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.isBlank;
import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.readText;

@Component
public class GithubApiClient {

    private static final String GITHUB_USER_URL = "https://api.github.com/user";
    private static final String GITHUB_REPOS_URL = "https://api.github.com/user/repos";
    private static final String GITHUB_API_VERSION = "2022-11-28";
    private static final int GITHUB_REPOS_PER_PAGE = 100;
    private static final int MAX_GITHUB_REPO_PAGES = 5;

    private final RestTemplate restTemplate = new RestTemplate();

    public GithubUserResponse fetchAuthenticatedUser(String accessToken) {
        try {
            ResponseEntity<GithubUserResponse> response = restTemplate.exchange(
                    GITHUB_USER_URL,
                    HttpMethod.GET,
                    new HttpEntity<>(buildGithubApiHeaders(accessToken)),
                    GithubUserResponse.class);

            GithubUserResponse body = response.getBody();
            if (body == null || body.id() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "GitHub profile fetch returned empty user payload");
            }

            return body;

        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode() == HttpStatus.UNAUTHORIZED
                    || exception.getStatusCode() == HttpStatus.FORBIDDEN) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "GitHub profile fetch unauthorized. Reconnect is required.",
                        exception);
            }
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "GitHub profile fetch failed",
                    exception);
        } catch (RestClientException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "GitHub profile fetch failed",
                    exception);
        }
    }

    public List<GithubRepoResponse> fetchOwnedRepositories(String accessToken) {
        List<GithubRepoResponse> results = new ArrayList<>();

        for (int page = 1; page <= MAX_GITHUB_REPO_PAGES; page++) {
            String url = UriComponentsBuilder.fromUriString(GITHUB_REPOS_URL)
                    .queryParam("type", "owner")
                    .queryParam("sort", "updated")
                    .queryParam("direction", "desc")
                    .queryParam("per_page", GITHUB_REPOS_PER_PAGE)
                    .queryParam("page", page)
                    .build()
                    .toUriString();

            try {
                ResponseEntity<GithubRepoResponse[]> response = restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        new HttpEntity<>(buildGithubApiHeaders(accessToken)),
                        GithubRepoResponse[].class);

                GithubRepoResponse[] body = response.getBody();
                if (body == null || body.length == 0) {
                    break;
                }

                results.addAll(Arrays.asList(body));
                if (body.length < GITHUB_REPOS_PER_PAGE) {
                    break;
                }
            } catch (RestClientResponseException exception) {
                if (exception.getStatusCode() == HttpStatus.UNAUTHORIZED
                        || exception.getStatusCode() == HttpStatus.FORBIDDEN) {
                    throw new ResponseStatusException(
                            HttpStatus.UNAUTHORIZED,
                            "GitHub repository fetch unauthorized. Reconnect is required.",
                            exception);
                }
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "GitHub repository fetch failed",
                        exception);
            } catch (RestClientException exception) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "GitHub repository fetch failed",
                        exception);
            }
        }

        return results;
    }

    public List<GithubPathEntry> fetchDirectoryEntries(
            String accessToken,
            String owner,
            String repo,
            String defaultBranch,
            String directoryPath) {
        String url;
        if (isBlank(directoryPath)) {
            url = UriComponentsBuilder
                    .fromUriString("https://api.github.com/repos/{owner}/{repo}/contents")
                    .queryParam("ref", isBlank(defaultBranch) ? "main" : defaultBranch)
                    .buildAndExpand(owner, repo)
                    .toUriString();
        } else {
            url = UriComponentsBuilder
                    .fromUriString("https://api.github.com/repos/{owner}/{repo}/contents/{path}")
                    .queryParam("ref", isBlank(defaultBranch) ? "main" : defaultBranch)
                    .buildAndExpand(owner, repo, directoryPath)
                    .toUriString();
        }

        try {
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(buildGithubApiHeaders(accessToken)),
                    JsonNode.class);

            JsonNode body = response.getBody();
            if (body == null || !body.isArray()) {
                return List.of();
            }

            List<GithubPathEntry> entries = new ArrayList<>();
            for (JsonNode entry : body) {
                if (!entry.isObject()) {
                    continue;
                }

                String type = readText(entry, "type");
                String name = readText(entry, "name");
                String path = readText(entry, "path");
                if (isBlank(type) || isBlank(name) || isBlank(path)) {
                    continue;
                }

                entries.add(new GithubPathEntry(path, name, type));
            }
            return entries;
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode() == HttpStatus.NOT_FOUND) {
                return List.of();
            }
            if (exception.getStatusCode() == HttpStatus.UNAUTHORIZED
                    || exception.getStatusCode() == HttpStatus.FORBIDDEN) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "GitHub backend directory listing unauthorized. Reconnect is required.",
                        exception);
            }
            return List.of();
        } catch (Exception exception) {
            return List.of();
        }
    }

    public String fetchTextFile(
            String accessToken,
            String owner,
            String repo,
            String defaultBranch,
            String path) {
        String url = UriComponentsBuilder
                .fromUriString("https://api.github.com/repos/{owner}/{repo}/contents/{path}")
                .queryParam("ref", isBlank(defaultBranch) ? "main" : defaultBranch)
                .buildAndExpand(owner, repo, path)
                .toUriString();

        ResponseEntity<GithubContentResponse> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(buildGithubApiHeaders(accessToken)),
                GithubContentResponse.class);

        GithubContentResponse body = response.getBody();
        if (body == null || isBlank(body.content())) {
            return null;
        }
        if (!"base64".equalsIgnoreCase(body.encoding())) {
            return null;
        }

        byte[] decoded = Base64.getDecoder().decode(body.content().replace("\n", ""));
        return new String(decoded, StandardCharsets.UTF_8);
    }

    private HttpHeaders buildGithubApiHeaders(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("X-GitHub-Api-Version", GITHUB_API_VERSION);
        headers.set("Accept", "application/vnd.github+json");
        return headers;
    }
}
