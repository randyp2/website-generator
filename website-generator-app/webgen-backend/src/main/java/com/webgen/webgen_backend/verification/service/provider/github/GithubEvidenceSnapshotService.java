package com.webgen.webgen_backend.verification.service.provider.github;

import com.webgen.webgen_backend.verification.service.provider.github.model.GithubAuthorshipSignal;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubRepoResponse;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubUserResponse;
import com.webgen.webgen_backend.verification.service.sync.model.EvidenceCandidate;
import com.webgen.webgen_backend.verification.service.sync.model.ProviderSyncSnapshot;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.isBlank;

/** Collects a bounded GitHub evidence snapshot for one provider sync. */
@Slf4j
@Service
@RequiredArgsConstructor
public class GithubEvidenceSnapshotService {

    private static final int MAX_REPOS_WITH_PACKAGE_SCAN = 30;
    private static final int MAX_REPOS_WITH_AUTHORSHIP_SCAN = 30;

    private final GithubApiClient githubApiClient;
    private final GithubEvidenceCandidateMapper candidateMapper;
    private final GithubRepositoryInsightsClient repositoryInsightsClient;
    private final GithubRepositorySignalScanner repositorySignalScanner;

    /** Fetches profile and repository evidence with bounded supplemental API calls. */
    public ProviderSyncSnapshot fetch(String accessToken, OffsetDateTime capturedAt) {
        GithubUserResponse profile = githubApiClient.fetchAuthenticatedUser(accessToken);
        List<GithubRepoResponse> repositories = repositoryInsightsClient.enrichForkLineage(
                accessToken,
                githubApiClient.fetchOwnedRepositories(accessToken));
        List<String> repositoryNames = repositories.stream()
                .map(GithubRepoResponse::fullName)
                .filter(name -> !isBlank(name))
                .toList();

        List<EvidenceCandidate> candidates = new ArrayList<>();
        candidates.add(candidateMapper.fromProfile(profile, capturedAt));

        int dependencyScans = 0;
        int authorshipScans = 0;
        for (GithubRepoResponse repository : repositories) {
            if (repository == null || isBlank(repository.fullName())) {
                continue;
            }

            Map<String, String> dependencySources = Map.of();
            if (dependencyScans < MAX_REPOS_WITH_PACKAGE_SCAN) {
                dependencySources = repositorySignalScanner.scanRepository(
                        accessToken,
                        repository.fullName(),
                        repository.defaultBranch());
                dependencyScans++;
            }

            GithubAuthorshipSignal authorship;
            if (authorshipScans < MAX_REPOS_WITH_AUTHORSHIP_SCAN) {
                authorship = repositoryInsightsClient.assessAuthorship(
                        accessToken, repository, profile.login());
                authorshipScans++;
            } else {
                authorship = GithubAuthorshipSignal.unavailable("scan_limit");
            }

            EvidenceCandidate candidate = candidateMapper.fromRepository(
                    repository,
                    dependencySources,
                    authorship,
                    capturedAt);
            if (candidate == null) {
                continue;
            }

            candidates.add(candidate);
            log.info("github.evidence_candidate fullName={} occurredAt={} capturedAt={} "
                            + "dependencyCount={} authorshipStatus={} authoredCommitCount={} "
                            + "authorshipWeight={} authorshipReason={}",
                    repository.fullName(), candidate.occurredAt(), candidate.capturedAt(),
                    dependencySources.size(), authorship.status(), authorship.authoredCommitCount(),
                    authorship.weight(), authorship.reason());
        }

        return new ProviderSyncSnapshot(
                candidates,
                repositoryNames,
                dependencyScans,
                profile.login(),
                profile.id());
    }
}
