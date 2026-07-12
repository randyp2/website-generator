package com.webgen.webgen_backend.verification.service.provider.github;

import com.webgen.webgen_backend.verification.service.provider.github.model.GithubContentResponse;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubRepoResponse;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubTreeResponse;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubUserResponse;
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
@Component
public class GithubApiClient {

    private static final String GITHUB_USER_URL = "https://api.github.com/user";
    private static final String GITHUB_REPOS_URL = "https://api.github.com/user/repos";
    private static final String GITHUB_API_VERSION = "2022-11-28";
    private static final int GITHUB_REPOS_PER_PAGE = 100;
    private static final int MAX_GITHUB_REPO_PAGES = 5;
    private static final int MAX_FORK_LINEAGE_LOOKUPS = 25;

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

    /**
     * Resolves root repository identities for a bounded number of forks. GitHub's
     * repository list omits parent and source lineage, while repository detail
     * responses include it.
     */
    public List<GithubRepoResponse> enrichForkLineage(
            String accessToken,
            List<GithubRepoResponse> repositories
    ) {
        if (repositories == null || repositories.isEmpty()) {
            return List.of();
        }

        List<GithubRepoResponse> enriched = new ArrayList<>(repositories.size());
        int lookups = 0;
        int resolved = 0;
        for (GithubRepoResponse repository : repositories) {
            boolean needsLineage = repository != null
                    && repository.isFork()
                    && repository.source() == null
                    && repository.parent() == null
                    && lookups < MAX_FORK_LINEAGE_LOOKUPS;
            if (!needsLineage) {
                enriched.add(repository);
                continue;
            }

            lookups++;
            GithubRepoResponse details = fetchRepositoryDetails(accessToken, repository);
            enriched.add(details);
            if (details.source() != null || details.parent() != null) {
                resolved++;
            }
        }

        log.info("github.fork_lineage repositories={} lookups={} resolved={} limit={}",
                repositories.size(), lookups, resolved, MAX_FORK_LINEAGE_LOOKUPS);
        return List.copyOf(enriched);
    }

    private GithubRepoResponse fetchRepositoryDetails(
            String accessToken,
            GithubRepoResponse fallback
    ) {
        if (fallback == null || isBlank(fallback.fullName()) || !fallback.fullName().contains("/")) {
            return fallback;
        }

        String[] nameParts = fallback.fullName().split("/", 2);
        String url = UriComponentsBuilder
                .fromUriString("https://api.github.com/repos/{owner}/{repo}")
                .buildAndExpand(nameParts[0], nameParts[1])
                .toUriString();
        try {
            ResponseEntity<GithubRepoResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(buildGithubApiHeaders(accessToken)),
                    GithubRepoResponse.class);
            return response.getBody() == null ? fallback : response.getBody();
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode() == HttpStatus.UNAUTHORIZED
                    || exception.getStatusCode() == HttpStatus.FORBIDDEN) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "GitHub fork lineage fetch unauthorized. Reconnect is required.",
                        exception);
            }
            log.warn("github.fork_lineage.unavailable fullName={} status={}",
                    fallback.fullName(), exception.getStatusCode().value());
            return fallback;
        } catch (RestClientException exception) {
            log.warn("github.fork_lineage.unavailable fullName={} reason={}",
                    fallback.fullName(), exception.getClass().getSimpleName());
            return fallback;
        }
    }

    /**
     * Fetches a repository's full file listing in a single call via the Git Trees
     * API (GET /repos/{owner}/{repo}/git/trees/{ref}?recursive=1), returning the
     * flat list of file (blob) paths. This replaces directory-by-directory
     * traversal for locating files of interest.
     *
     * For very large repositories GitHub may truncate the tree; that case is
     * logged and the partial listing is returned rather than failing the sync.
     *
     * @param ref branch name or commit/tree SHA to read the tree at
     * @return repo-root-relative file paths, or an empty list if unavailable
     */
    public List<String> fetchRepositoryTree(
            String accessToken,
            String owner,
            String repo,
            String ref) {
        String url = UriComponentsBuilder
                .fromUriString("https://api.github.com/repos/{owner}/{repo}/git/trees/{ref}")
                .queryParam("recursive", "1")
                .buildAndExpand(owner, repo, isBlank(ref) ? "main" : ref)
                .toUriString();

        try {
            ResponseEntity<GithubTreeResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(buildGithubApiHeaders(accessToken)),
                    GithubTreeResponse.class);

            GithubTreeResponse body = response.getBody();
            if (body == null || body.tree() == null) {
                return List.of();
            }

            if (body.truncated()) {
                log.warn(
                        "github.tree.truncated owner={} repo={} ref={} returnedEntries={}",
                        owner,
                        repo,
                        ref,
                        body.tree().size());
            }

            return body.tree().stream()
                    .filter(entry -> entry != null && "blob".equals(entry.type()))
                    .map(GithubTreeResponse.Entry::path)
                    .filter(path -> !isBlank(path))
                    .toList();
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode() == HttpStatus.UNAUTHORIZED
                    || exception.getStatusCode() == HttpStatus.FORBIDDEN) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "GitHub repository tree fetch unauthorized. Reconnect is required.",
                        exception);
            }
            return List.of();
        } catch (RestClientException exception) {
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
