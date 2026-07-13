package com.webgen.webgen_backend.verification.service.provider.github;

import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprint;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubAuthorshipSignal;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubRepoResponse;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubRepositoryScanResult;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubUserResponse;
import com.webgen.webgen_backend.verification.service.sync.model.EvidenceCandidate;
import com.webgen.webgen_backend.verification.service.sync.model.ProviderSyncSnapshot;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
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
    private static final int MAX_REPOS_WITH_FINGERPRINT_SCAN = 15;

    private final GithubApiClient githubApiClient;
    private final GithubEvidenceCandidateMapper candidateMapper;
    private final GithubRepositoryInsightsClient repositoryInsightsClient;
    private final GithubRepositorySignalScanner repositorySignalScanner;
    private final GithubSemanticEvidenceGrouper semanticEvidenceGrouper;
    private final GithubDerivativeCreditAssigner derivativeCreditAssigner;

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
        Map<String, ArtifactSemanticFingerprint> fingerprintsByExternalId = new LinkedHashMap<>();

        int dependencyScans = 0;
        int authorshipScans = 0;
        int fingerprintScans = 0;
        for (GithubRepoResponse repository : repositories) {
            if (repository == null || isBlank(repository.fullName())) {
                continue;
            }

            GithubRepositoryScanResult repositoryScan = GithubRepositoryScanResult.empty();
            if (dependencyScans < MAX_REPOS_WITH_PACKAGE_SCAN) {
                boolean includeFingerprint = fingerprintScans < MAX_REPOS_WITH_FINGERPRINT_SCAN;
                repositoryScan = repositorySignalScanner.scanRepository(
                        accessToken,
                        repository.fullName(),
                        repository.defaultBranch(),
                        includeFingerprint);
                dependencyScans++;
                if (includeFingerprint) {
                    fingerprintScans++;
                }
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
                    repositoryScan.dependencySources(),
                    authorship,
                    repositoryScan.semanticFingerprint(),
                    capturedAt);
            if (candidate == null) {
                continue;
            }

            candidates.add(candidate);
            if (repositoryScan.semanticFingerprint() != null) {
                fingerprintsByExternalId.put(
                        candidate.externalId(), repositoryScan.semanticFingerprint());
            }
            log.info("github.evidence_candidate fullName={} occurredAt={} capturedAt={} "
                            + "dependencyCount={} authorshipStatus={} authoredCommitCount={} "
                            + "directCommitCount={} mergeCommitCount={} activeDayCount={} "
                            + "authorshipWeight={} authorshipReason={} fingerprinted={}",
                    repository.fullName(), candidate.occurredAt(), candidate.capturedAt(),
                    repositoryScan.dependencySources().size(), authorship.status(),
                    authorship.authoredCommitCount(),
                    authorship.directCommitCount(), authorship.mergeCommitCount(),
                    authorship.activeDayCount(), authorship.weight(), authorship.reason(),
                    repositoryScan.semanticFingerprint() != null);
        }

        List<EvidenceCandidate> groupedCandidates = semanticEvidenceGrouper.group(
                candidates, fingerprintsByExternalId);
        List<EvidenceCandidate> weightedCandidates = derivativeCreditAssigner.assign(
                groupedCandidates, fingerprintsByExternalId);
        log.info("github.semantic_scan repositories={} fingerprintAttempts={} fingerprints={} "
                        + "scanLimit={}",
                repositories.size(), fingerprintScans, fingerprintsByExternalId.size(),
                MAX_REPOS_WITH_FINGERPRINT_SCAN);

        return new ProviderSyncSnapshot(
                weightedCandidates,
                repositoryNames,
                dependencyScans,
                profile.login(),
                profile.id());
    }
}
