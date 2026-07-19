package com.webgen.webgen_backend.verification.service.provider.github;

import com.webgen.webgen_backend.verification.service.provider.github.model.GithubAuthorshipSignal;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubCommitResponse;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubRepoResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.isBlank;

/** Fetches bounded repository lineage and authorship signals from GitHub. */
@Slf4j
@Component
public class GithubRepositoryInsightsClient {

    private static final String GITHUB_API_VERSION = "2022-11-28";
    private static final int MAX_FORK_LINEAGE_LOOKUPS = 25;
    private static final int AUTHORSHIP_COMMIT_SAMPLE_SIZE = 5;

    private final RestTemplate restTemplate;
    private final GithubCommitContributionAnalyzer contributionAnalyzer;

    @Autowired
    public GithubRepositoryInsightsClient(GithubCommitContributionAnalyzer contributionAnalyzer) {
        this(new RestTemplate(), contributionAnalyzer);
    }

    GithubRepositoryInsightsClient(RestTemplate restTemplate) {
        this(restTemplate, new GithubCommitContributionAnalyzer());
    }

    GithubRepositoryInsightsClient(
            RestTemplate restTemplate,
            GithubCommitContributionAnalyzer contributionAnalyzer
    ) {
        this.restTemplate = restTemplate;
        this.contributionAnalyzer = contributionAnalyzer;
    }

    /** Resolves root identities for a bounded number of forks. */
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

    /** Counts up to five commits attributed by GitHub to the authenticated login. */
    public GithubAuthorshipSignal assessAuthorship(
            String accessToken,
            GithubRepoResponse repository,
            String login
    ) {
        String[] nameParts = splitRepositoryName(repository);
        if (nameParts == null || isBlank(login)) {
            return GithubAuthorshipSignal.unavailable("missing_repository_or_login");
        }

        String url = UriComponentsBuilder
                .fromUriString("https://api.github.com/repos/{owner}/{repo}/commits")
                .queryParam("author", login)
                .queryParam("per_page", AUTHORSHIP_COMMIT_SAMPLE_SIZE)
                .buildAndExpand(nameParts[0], nameParts[1])
                .toUriString();
        try {
            ResponseEntity<GithubCommitResponse[]> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(buildGithubApiHeaders(accessToken)),
                    GithubCommitResponse[].class);
            GithubCommitResponse[] commits = response.getBody();
            return contributionAnalyzer.assess(
                    commits == null ? List.of() : Arrays.asList(commits),
                    repository.isFork());
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "GitHub authorship fetch unauthorized. Reconnect is required.",
                        exception);
            }
            if (exception.getStatusCode() == HttpStatus.CONFLICT) {
                return contributionAnalyzer.assess(List.of(), repository.isFork());
            }
            log.warn("github.authorship.unavailable fullName={} status={}",
                    repository.fullName(), exception.getStatusCode().value());
            return GithubAuthorshipSignal.unavailable(
                    "github_status_" + exception.getStatusCode().value());
        } catch (RestClientException exception) {
            log.warn("github.authorship.unavailable fullName={} reason={}",
                    repository.fullName(), exception.getClass().getSimpleName());
            return GithubAuthorshipSignal.unavailable("github_request_failed");
        }
    }

    private GithubRepoResponse fetchRepositoryDetails(
            String accessToken,
            GithubRepoResponse fallback
    ) {
        String[] nameParts = splitRepositoryName(fallback);
        if (nameParts == null) {
            return fallback;
        }

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
            if (exception.getStatusCode() == HttpStatus.UNAUTHORIZED) {
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

    private String[] splitRepositoryName(GithubRepoResponse repository) {
        if (repository == null || isBlank(repository.fullName())
                || !repository.fullName().contains("/")) {
            return null;
        }
        String[] parts = repository.fullName().split("/", 2);
        return isBlank(parts[0]) || isBlank(parts[1]) ? null : parts;
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
