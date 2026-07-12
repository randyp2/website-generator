package com.webgen.webgen_backend.verification.service.impl;

import com.webgen.webgen_backend.verification.dto.connection.SyncEvidenceStatsDTO;
import com.webgen.webgen_backend.verification.dto.connection.SyncLinkStatsDTO;
import com.webgen.webgen_backend.verification.dto.connection.SyncProviderResponseDTO;
import com.webgen.webgen_backend.verification.dto.summary.VerificationSummaryDTO;
import com.webgen.webgen_backend.verification.entity.Claim;
import com.webgen.webgen_backend.verification.entity.ClaimEvidenceLink;
import com.webgen.webgen_backend.verification.entity.ConnectedAccount;
import com.webgen.webgen_backend.verification.entity.Evidence;
import com.webgen.webgen_backend.verification.entity.Skill;
import com.webgen.webgen_backend.verification.repository.ClaimEvidenceLinkRepository;
import com.webgen.webgen_backend.verification.repository.ClaimRepository;
import com.webgen.webgen_backend.verification.repository.ConnectedAccountRepository;
import com.webgen.webgen_backend.verification.repository.EvidenceRepository;
import com.webgen.webgen_backend.verification.repository.SkillRepository;
import com.webgen.webgen_backend.verification.service.ConnectionSyncService;
import com.webgen.webgen_backend.verification.service.SkillVerificationSummaryService;
import com.webgen.webgen_backend.verification.service.ClaimVerificationStatusService;
import com.webgen.webgen_backend.verification.service.provider.github.GithubApiClient;
import com.webgen.webgen_backend.verification.service.provider.github.GithubEvidenceCandidateMapper;
import com.webgen.webgen_backend.verification.service.provider.github.GithubRepositorySignalScanner;
import com.webgen.webgen_backend.verification.service.provider.github.GithubSyncTokenService;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubRepoResponse;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubSyncTokenResult;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubUserResponse;
import com.webgen.webgen_backend.verification.service.shared.ProviderNormalizationHelper;
import com.webgen.webgen_backend.verification.service.sync.ClaimEvidenceMatcher;
import com.webgen.webgen_backend.verification.service.sync.model.ClaimEvidenceMatchResult;
import com.webgen.webgen_backend.verification.service.sync.model.ClaimTermSet;
import com.webgen.webgen_backend.verification.service.sync.model.EvidenceCandidate;
import com.webgen.webgen_backend.verification.service.sync.model.EvidenceUpsertResult;
import com.webgen.webgen_backend.verification.service.sync.model.ProviderSyncSnapshot;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConnectionSyncServiceImpl implements ConnectionSyncService {

    private static final Set<String> SUPPORTED_PROVIDERS = Set.of(
            "linkedin",
            "github",
            "website",
            "other");

    private static final String PROVIDER_GITHUB = "github";

    private static final String ACCOUNT_STATUS_CONNECTED = "connected";
    private static final String ACCOUNT_STATUS_EXPIRED = "expired";

    private static final String SYNC_STATUS_RUNNING = "running";
    private static final String SYNC_STATUS_SUCCESS = "success";
    private static final String SYNC_STATUS_FAILED = "failed";

    private static final String CLAIM_STATUS_PENDING = "pending";
    private static final String CLAIM_STATUS_VERIFIED = "verified";
    private static final String CLAIM_STATUS_CORROBORATED = "corroborated";
    private static final String CLAIM_STATUS_NEEDS_EVIDENCE = "needs_evidence";
    private static final String CLAIM_STATUS_USER_CONFIRMED = "user_confirmed";
    private static final String CLAIM_STATUS_REJECTED = "rejected";

    private static final int MAX_REPOS_WITH_PACKAGE_SCAN = 30;

    private final ConnectedAccountRepository connectedAccountRepository;
    private final EvidenceRepository evidenceRepository;
    private final ClaimRepository claimRepository;
    private final ClaimEvidenceLinkRepository claimEvidenceLinkRepository;
    private final SkillRepository skillRepository;
    private final SkillVerificationSummaryService skillVerificationSummaryService;
    private final GithubApiClient githubApiClient;
    private final GithubEvidenceCandidateMapper githubEvidenceCandidateMapper;
    private final GithubRepositorySignalScanner githubRepositorySignalScanner;
    private final GithubSyncTokenService githubSyncTokenService;
    private final ClaimEvidenceMatcher claimEvidenceMatcher;
    private final ClaimVerificationStatusService claimVerificationStatusService;

    @Override
    @Transactional
    public SyncProviderResponseDTO syncProvider(UUID profileId, String provider) {
        String normalizedProvider = ProviderNormalizationHelper.normalizeProvider(
                provider,
                SUPPORTED_PROVIDERS);

        ConnectedAccount account = connectedAccountRepository
                .findByProfileIdAndProvider(profileId, normalizedProvider)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Connected account with profile and provider not found"));

        logSync(
                "Connection sync started profileId="
                        + profileId
                        + " provider="
                        + normalizedProvider
                        + " accountId="
                        + account.getId());

        if (!ACCOUNT_STATUS_CONNECTED.equals(account.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Provider account is not connected");
        }

        if (!isSyncImplementedForProvider(normalizedProvider)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_IMPLEMENTED,
                    "Sync is not implemented for provider: " + normalizedProvider);
        }

        OffsetDateTime startedAt = OffsetDateTime.now();

        markSyncRunning(account, startedAt);
        connectedAccountRepository.save(account);
        logSync(
                "Connection sync marked running profileId="
                        + profileId
                        + " provider="
                        + normalizedProvider
                        + " startedAt="
                        + startedAt);

        try {

            GithubSyncTokenResult token = githubSyncTokenService.ensureValidAccessToken(
                    account,
                    normalizedProvider,
                    startedAt);
            logSync(
                    "Connection sync token ready profileId="
                            + profileId
                            + " provider="
                            + normalizedProvider
                            + " tokenRefreshed="
                            + token.tokenRefreshed()
                            + " accessTokenExpiresAt="
                            + account.getAccessTokenExpiresAt()
                            + " refreshTokenExpiresAt="
                            + account.getRefreshTokenExpiresAt());

            ProviderSyncSnapshot snapshot = fetchGithubEvidenceSnapshot(
                    token.accessToken(),
                    startedAt);
            logSync(
                    "Connection sync fetched provider data profileId="
                            + profileId
                            + " provider="
                            + normalizedProvider
                            + " githubUserLogin="
                            + snapshot.providerUserLogin()
                            + " githubUserId="
                            + snapshot.providerUserId()
                            + " repositoryCount="
                            + snapshot.repositoryNames().size()
                            + " dependencyScannedCount="
                            + snapshot.dependencyScannedCount());
            logSync(
                    "Connection sync repos pulled profileId="
                            + profileId
                            + " provider="
                            + normalizedProvider
                            + " repositories="
                            + formatRepoNamesForLog(snapshot.repositoryNames()));

            EvidenceUpsertResult upsertResult = upsertEvidence(
                    account,
                    normalizedProvider,
                    snapshot.candidates(),
                    startedAt);

            SyncEvidenceStatsDTO evidenceStats = SyncEvidenceStatsDTO.builder()
                    .fetched(snapshot.candidates().size())
                    .inserted(upsertResult.inserted())
                    .updated(upsertResult.updated())
                    .unchanged(upsertResult.unchanged())
                    .build();
            logSync(
                    "Connection sync evidence upsert complete profileId="
                            + profileId
                            + " provider="
                            + normalizedProvider
                            + " fetched="
                            + evidenceStats.getFetched()
                            + " inserted="
                            + evidenceStats.getInserted()
                            + " updated="
                            + evidenceStats.getUpdated()
                            + " unchanged="
                            + evidenceStats.getUnchanged());

            SyncLinkStatsDTO linkStats = linkEvidenceToClaims(
                    profileId,
                    normalizedProvider,
                    upsertResult.persistedEvidence(),
                    startedAt);
            logSync(
                    "Connection sync deterministic linking complete profileId="
                            + profileId
                            + " provider="
                            + normalizedProvider
                            + " inserted="
                            + linkStats.getInserted()
                            + " updated="
                            + linkStats.getUpdated()
                            + " removed="
                            + linkStats.getRemoved()
                            + " claimsMatched="
                            + linkStats.getClaimsMatched());

            claimVerificationStatusService.reconcileProfile(profileId);
            int claimStatusesUpdated = 0;
            logSync(
                    "Connection sync claim status reconciliation complete profileId="
                            + profileId
                            + " provider="
                            + normalizedProvider
                            + " updated="
                            + claimStatusesUpdated);

            OffsetDateTime completedAt = OffsetDateTime.now();
            int importedCount = safeCount(evidenceStats.getInserted())
                    + safeCount(evidenceStats.getUpdated());
            int linkedCount = safeCount(linkStats.getInserted())
                    + safeCount(linkStats.getUpdated());

            markSyncSuccess(account, completedAt, importedCount, linkedCount);
            connectedAccountRepository.save(account);
            long durationMs = Duration.between(startedAt, completedAt).toMillis();

            logFinalScoreSnapshot(profileId, normalizedProvider);
            logSync(
                    "Connection sync completed profileId="
                            + profileId
                            + " provider="
                            + normalizedProvider
                            + " status="
                            + SYNC_STATUS_SUCCESS
                            + " durationMs="
                            + durationMs
                            + " importedCount="
                            + importedCount
                            + " linkedCount="
                            + linkedCount);

            return SyncProviderResponseDTO.builder()
                    .provider(normalizedProvider)
                    .syncStatus(SYNC_STATUS_SUCCESS)
                    .startedAt(startedAt)
                    .completedAt(completedAt)
                    .tokenRefreshed(token.tokenRefreshed())
                    .evidence(evidenceStats)
                    .links(linkStats)
                    .error(null)
                    .build();
        } catch (Exception exception) {

            // Reset connectedAccount row to reflect failure
            OffsetDateTime completedAt = OffsetDateTime.now();
            String error = resolveErrorMessage(exception);

            markSyncFailed(account, completedAt, error);
            if (isTokenFailure(exception)) {
                account.setStatus(ACCOUNT_STATUS_EXPIRED);
            }
            connectedAccountRepository.save(account);
            long durationMs = Duration.between(startedAt, completedAt).toMillis();
            logSync(
                    "Connection sync failed profileId="
                            + profileId
                            + " provider="
                            + normalizedProvider
                            + " status="
                            + SYNC_STATUS_FAILED
                            + " durationMs="
                            + durationMs
                            + " error="
                            + error
                            + " exceptionType="
                            + exception.getClass().getSimpleName());

            // Build response to notify client sync failed
            return SyncProviderResponseDTO.builder()
                    .provider(normalizedProvider)
                    .syncStatus(SYNC_STATUS_FAILED)
                    .startedAt(startedAt)
                    .completedAt(completedAt)
                    .tokenRefreshed(false)
                    .evidence(SyncEvidenceStatsDTO.builder()
                            .fetched(0)
                            .inserted(0)
                            .updated(0)
                            .unchanged(0)
                            .build())
                    .links(SyncLinkStatsDTO.builder()
                            .inserted(0)
                            .updated(0)
                            .removed(0)
                            .claimsMatched(0)
                            .build())
                    .error(error)
                    .build();
        }
    }

    private boolean isSyncImplementedForProvider(String provider) {
        return PROVIDER_GITHUB.equals(provider);
    }

    /**
     * Fetches GitHub profile/repository data and converts it into evidence
     * candidates.
     *
     * Profile is always captured. Dependency extraction is capped to keep
     * manual sync latency predictable.
     */
    private ProviderSyncSnapshot fetchGithubEvidenceSnapshot(
            String accessToken,
            OffsetDateTime capturedAt) {

        // Fetch user info
        // - profile metadata
        // - users repostiories
        GithubUserResponse profile = githubApiClient.fetchAuthenticatedUser(accessToken);
        List<GithubRepoResponse> repositories = githubApiClient.enrichForkLineage(
                accessToken,
                githubApiClient.fetchOwnedRepositories(accessToken));
        List<String> repositoryNames = repositories.stream()
                .map(GithubRepoResponse::fullName)
                .filter(name -> !isBlank(name))
                .toList();

        List<EvidenceCandidate> candidates = new ArrayList<>();
        candidates.add(githubEvidenceCandidateMapper.fromProfile(profile, capturedAt));

        int dependencyScans = 0;
        for (GithubRepoResponse repo : repositories) {
            Map<String, String> dependencySources = Map.of();
            if (dependencyScans < MAX_REPOS_WITH_PACKAGE_SCAN) {
                dependencySources = githubRepositorySignalScanner.scanRepository(
                        accessToken,
                        repo.fullName(),
                        repo.defaultBranch());
                dependencyScans++;
            }

            EvidenceCandidate candidate = githubEvidenceCandidateMapper.fromRepository(
                    repo,
                    dependencySources,
                    capturedAt);
            if (candidate != null) {
                candidates.add(candidate);
                logSync(
                        "Connection sync repo candidate timestamp fullName="
                                + repo.fullName()
                                + " pushedAtRaw="
                                + repo.pushedAt()
                                + " occurredAt="
                                + candidate.occurredAt()
                                + " capturedAt="
                                + candidate.capturedAt()
                                + " dependencyCount="
                                + dependencySources.size());
            }

        }

        return new ProviderSyncSnapshot(
                candidates,
                repositoryNames,
                dependencyScans,
                profile.login(),
                profile.id());
    }

    private EvidenceUpsertResult upsertEvidence(
            ConnectedAccount account,
            String provider,
            List<EvidenceCandidate> candidates,
            OffsetDateTime now) {
        int inserted = 0;
        int updated = 0;
        int unchanged = 0;

        List<Evidence> persisted = new ArrayList<>();
        UUID profileId = account.getProfile().getId();

        for (EvidenceCandidate candidate : candidates) {
            if (candidate == null || isBlank(candidate.externalId())) {
                continue;
            }

            int occurredAgeDays = resolveEvidenceAgeDays(
                    candidate.occurredAt(),
                    candidate.capturedAt(),
                    now
            );
            if (occurredAgeDays >= 180) {
                logSync(
                        "Connection sync stale evidence candidate detected profileId="
                                + profileId
                                + " provider="
                                + provider
                                + " externalId="
                                + candidate.externalId()
                                + " evidenceType="
                                + candidate.evidenceType()
                                + " title="
                                + candidate.title()
                                + " occurredAt="
                                + candidate.occurredAt()
                                + " capturedAt="
                                + candidate.capturedAt()
                                + " ageDays="
                                + occurredAgeDays);
            }

            Evidence evidence = evidenceRepository
                    .findByProfileIdAndProviderAndExternalId(
                            profileId,
                            provider,
                            candidate.externalId())
                    .orElse(null);

            if (evidence == null) {
                Evidence created = Evidence.builder()
                        .id(UUID.randomUUID())
                        .profile(account.getProfile())
                        .provider(provider)
                        .externalId(candidate.externalId())
                        .evidenceGroupKey(resolveEvidenceGroupKey(provider, candidate))
                        .evidenceType(candidate.evidenceType())
                        .title(candidate.title())
                        .description(candidate.description())
                        .sourceUrl(candidate.sourceUrl())
                        .occurredAt(candidate.occurredAt())
                        .capturedAt(candidate.capturedAt())
                        .metadata(candidate.metadata())
                        .createdAt(now)
                        .updatedAt(now)
                        .build();

                persisted.add(evidenceRepository.save(created));
                inserted++;
                continue;
            }

            if (applyCandidateToEvidence(evidence, candidate, now)) {
                persisted.add(evidenceRepository.save(evidence));
                updated++;
            } else {
                persisted.add(evidence);
                unchanged++;
            }
        }

        return new EvidenceUpsertResult(inserted, updated, unchanged, persisted);
    }

    private boolean applyCandidateToEvidence(
            Evidence evidence,
            EvidenceCandidate candidate,
            OffsetDateTime now) {
        boolean changed = false;

        String evidenceGroupKey = resolveEvidenceGroupKey(evidence.getProvider(), candidate);
        if (!Objects.equals(evidence.getEvidenceGroupKey(), evidenceGroupKey)) {
            evidence.setEvidenceGroupKey(evidenceGroupKey);
            changed = true;
        }

        if (!Objects.equals(evidence.getEvidenceType(), candidate.evidenceType())) {
            evidence.setEvidenceType(candidate.evidenceType());
            changed = true;
        }
        if (!Objects.equals(evidence.getTitle(), candidate.title())) {
            evidence.setTitle(candidate.title());
            changed = true;
        }
        if (!Objects.equals(evidence.getDescription(), candidate.description())) {
            evidence.setDescription(candidate.description());
            changed = true;
        }
        if (!Objects.equals(evidence.getSourceUrl(), candidate.sourceUrl())) {
            evidence.setSourceUrl(candidate.sourceUrl());
            changed = true;
        }
        if (!Objects.equals(evidence.getOccurredAt(), candidate.occurredAt())) {
            evidence.setOccurredAt(candidate.occurredAt());
            changed = true;
        }
        if (!Objects.equals(evidence.getCapturedAt(), candidate.capturedAt())) {
            evidence.setCapturedAt(candidate.capturedAt());
            changed = true;
        }
        if (!Objects.equals(evidence.getMetadata(), candidate.metadata())) {
            evidence.setMetadata(candidate.metadata());
            changed = true;
        }

        if (changed) {
            evidence.setUpdatedAt(now);
        }

        return changed;
    }

    private String resolveEvidenceGroupKey(String provider, EvidenceCandidate candidate) {
        if (candidate.evidenceGroupKey() != null && !candidate.evidenceGroupKey().isBlank()) {
            return candidate.evidenceGroupKey();
        }
        return provider + ':' + candidate.externalId();
    }

    /**
     * Recomputes provider links between skill claims and evidence rows for the current sync run.
     *
     * This method is the deterministic join step after evidence upsert.
     * It evaluates every claim against every evidence candidate from this run, applies
     * rule-based matching, upserts matching rows in claim_evidence_links, and removes
     * stale provider-owned links that no longer match.
     *
     * Algorithm summary:
     * 1. Load skill claims for the profile and build normalized term sets per claim.
     * 2. For each claim and each evidence row, call the deterministic matcher.
     * 3. Insert or update link rows for matched pairs and track matched keys.
     * 4. Delete existing provider links whose claim|evidence key was not matched this run.
     * 5. Return inserted, updated, removed, and claimsMatched counts for sync telemetry.
     *
     * @param profileId profile owner of claims and evidence
     * @param provider normalized provider key for stale-link cleanup scope
     * @param currentRunEvidence evidence rows produced by the current provider snapshot
     * @param now sync evaluation timestamp used for persisted link updates
     * @return deterministic link mutation stats for the sync response
     */
    private SyncLinkStatsDTO linkEvidenceToClaims(
            UUID profileId,
            String provider,
            List<Evidence> currentRunEvidence,
            OffsetDateTime now) {
        List<Claim> claims = claimRepository.findSkillClaimsByProfileId(profileId);
        if (claims.isEmpty()) {
            return SyncLinkStatsDTO.builder()
                    .inserted(0)
                    .updated(0)
                    .removed(0)
                    .claimsMatched(0)
                    .build();
        }

        Map<UUID, String> canonicalNames = loadCanonicalSkillNamesById(claims);
        Map<UUID, List<String>> aliasesBySkillId = new HashMap<>();
        for (UUID skillId : canonicalNames.keySet()) {
            aliasesBySkillId.put(skillId, skillRepository.findAliasesBySkillId(skillId));
        }

        Set<String> matchedKeys = new HashSet<>();
        Set<UUID> matchedClaimIds = new HashSet<>();

        int inserted = 0;
        int updated = 0;

        for (Claim claim : claims) {
            String canonicalName = canonicalNames.get(claim.getCanonicalSkillId());
            List<String> aliases = claim.getCanonicalSkillId() == null
                    ? List.of()
                    : aliasesBySkillId.getOrDefault(claim.getCanonicalSkillId(), List.of());

            ClaimTermSet termSet = claimEvidenceMatcher.buildTermSet(
                    claim.getRawValue(),
                    canonicalName,
                    aliases);

            if (termSet.terms().isEmpty()) {
                continue;
            }

            for (Evidence evidence : currentRunEvidence) {
                ClaimEvidenceMatchResult match = claimEvidenceMatcher.evaluate(termSet, evidence);
                if (!match.matched()) {
                    continue;
                }

                matchedClaimIds.add(claim.getId());
                String key = linkKey(claim.getId(), evidence.getId());
                matchedKeys.add(key);

                int evidenceAgeDays = resolveEvidenceAgeDays(
                        evidence.getOccurredAt(),
                        evidence.getCapturedAt(),
                        now
                );
                if ("name_match".equals(match.linkType()) || evidenceAgeDays >= 180) {
                    logSync(
                            "Connection sync match detail profileId="
                                    + profileId
                                    + " claimId="
                                    + claim.getId()
                                    + " claimRawValue="
                                    + claim.getRawValue()
                                    + " canonicalSkill="
                                    + canonicalName
                                    + " evidenceId="
                                    + evidence.getId()
                                    + " evidenceExternalId="
                                    + evidence.getExternalId()
                                    + " evidenceTitle="
                                    + evidence.getTitle()
                                    + " linkType="
                                    + match.linkType()
                                    + " confidence="
                                    + match.confidence()
                                    + " reason="
                                    + match.reason()
                                    + " occurredAt="
                                    + evidence.getOccurredAt()
                                    + " capturedAt="
                                    + evidence.getCapturedAt()
                                    + " ageDays="
                                    + evidenceAgeDays);
                }

                ClaimEvidenceLink link = claimEvidenceLinkRepository
                        .findByProfileIdAndClaimIdAndEvidenceId(
                                profileId,
                                claim.getId(),
                                evidence.getId())
                        .orElse(null);

                if (link == null) {
                    ClaimEvidenceLink created = ClaimEvidenceLink.builder()
                            .id(UUID.randomUUID())
                            .profile(claim.getProfile())
                            .claimId(claim.getId())
                            .evidenceId(evidence.getId())
                            .linkType(match.linkType())
                            .linkConfidence(match.confidence())
                            .reason(match.reason())
                            .metadata(match.metadata())
                            .createdAt(now)
                            .updatedAt(now)
                            .build();
                    claimEvidenceLinkRepository.save(created);
                    inserted++;
                    continue;
                }

                if (applyMatchToLink(link, match, now)) {
                    claimEvidenceLinkRepository.save(link);
                    updated++;
                }
            }
        }

        List<UUID> claimIds = claims.stream().map(Claim::getId).toList();
        Set<UUID> providerEvidenceIds = evidenceRepository
                .findByProfileIdAndProviderOrderByCapturedAtDesc(profileId, provider)
                .stream()
                .map(Evidence::getId)
                .collect(Collectors.toSet());

        int removed = 0;
        List<ClaimEvidenceLink> existingLinks = claimEvidenceLinkRepository
                .findByProfileIdAndClaimIdIn(profileId, claimIds);

        for (ClaimEvidenceLink link : existingLinks) {
            if (!providerEvidenceIds.contains(link.getEvidenceId())) {
                continue;
            }

            String key = linkKey(link.getClaimId(), link.getEvidenceId());
            if (!matchedKeys.contains(key)) {
                claimEvidenceLinkRepository.delete(link);
                removed++;
            }
        }

        return SyncLinkStatsDTO.builder()
                .inserted(inserted)
                .updated(updated)
                .removed(removed)
                .claimsMatched(matchedClaimIds.size())
                .build();
    }

    /**
     * Reconciles claim workflow statuses based on canonical resolution + current linked evidence.
     *
     * Rules:
     * - manual review states (user_confirmed/rejected) are preserved
     * - unresolved claims stay pending
     * - resolved claims with evidence become verified
     * - resolved claims without evidence become needs_evidence
     *
     * @param profileId profile owner whose skill claims should be reconciled
     * @param now timestamp used for updated_at when status changes
     * @return number of claim rows whose status changed
     */
    private int reconcileClaimStatusesAfterSync(UUID profileId, OffsetDateTime now) {
        List<Claim> claims = claimRepository.findSkillClaimsByProfileId(profileId);
        if (claims.isEmpty()) {
            return 0;
        }

        List<UUID> claimIds = claims.stream().map(Claim::getId).toList();
        Map<UUID, Boolean> hasEvidenceByClaimId = claimEvidenceLinkRepository
                .findByProfileIdAndClaimIdIn(profileId, claimIds)
                .stream()
                .collect(Collectors.toMap(
                        ClaimEvidenceLink::getClaimId,
                        link -> true,
                        (left, right) -> left
                ));

        List<Claim> changedClaims = new ArrayList<>();
        for (Claim claim : claims) {
            String currentStatus = normalizeClaimStatus(claim.getStatus());
            if (isManualClaimStatus(currentStatus)) {
                continue;
            }

            String nextStatus = resolveSyncedClaimStatus(claim, hasEvidenceByClaimId);
            if (!Objects.equals(currentStatus, nextStatus)) {
                claim.setStatus(nextStatus);
                claim.setUpdatedAt(now);
                changedClaims.add(claim);
            }
        }

        if (!changedClaims.isEmpty()) {
            claimRepository.saveAll(changedClaims);
        }
        return changedClaims.size();
    }

    // Keeps unknown/null persisted values deterministic for sync reconciliation.
    private String normalizeClaimStatus(String status) {
        if (status == null || status.isBlank()) {
            return CLAIM_STATUS_PENDING;
        }
        return status.trim().toLowerCase(Locale.ROOT);
    }

    // Manual review states are controlled outside provider sync and should not be overwritten.
    private boolean isManualClaimStatus(String status) {
        return CLAIM_STATUS_USER_CONFIRMED.equals(status)
                || CLAIM_STATUS_REJECTED.equals(status);
    }

    // Provider sync derives status from canonical resolution and linked evidence presence.
    private String resolveSyncedClaimStatus(Claim claim, Map<UUID, Boolean> hasEvidenceByClaimId) {
        if (claim.getCanonicalSkillId() == null) {
            return CLAIM_STATUS_PENDING;
        }

        boolean hasEvidence = hasEvidenceByClaimId.getOrDefault(claim.getId(), false);
        // Connector evidence corroborates a claim. The verified tier is reserved
        // for qualifying reviewed evidence under the centralized status policy.
        return hasEvidence ? CLAIM_STATUS_CORROBORATED : CLAIM_STATUS_NEEDS_EVIDENCE;
    }

    /**
     * Loads canonical skill names for claims that are already normalized to a canonical id.
     */
    private Map<UUID, String> loadCanonicalSkillNamesById(List<Claim> claims) {
        Set<UUID> ids = claims.stream()
                .map(Claim::getCanonicalSkillId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (ids.isEmpty()) {
            return Map.of();
        }

        return skillRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Skill::getId, Skill::getName));
    }

    /** Applies match fields to an existing link and returns whether any persisted field changed. */
    private boolean applyMatchToLink(
            ClaimEvidenceLink link,
            ClaimEvidenceMatchResult match,
            OffsetDateTime now) {
        boolean changed = false;

        if (!Objects.equals(link.getLinkType(), match.linkType())) {
            link.setLinkType(match.linkType());
            changed = true;
        }
        if (!Objects.equals(link.getLinkConfidence(), match.confidence())) {
            link.setLinkConfidence(match.confidence());
            changed = true;
        }
        if (!Objects.equals(link.getReason(), match.reason())) {
            link.setReason(match.reason());
            changed = true;
        }
        if (!Objects.equals(link.getMetadata(), match.metadata())) {
            link.setMetadata(match.metadata());
            changed = true;
        }

        if (changed) {
            link.setUpdatedAt(now);
        }

        return changed;
    }

    /** Builds a stable in-memory key for claim/evidence pair dedupe within one sync run. */
    private String linkKey(UUID claimId, UUID evidenceId) {
        return claimId + "|" + evidenceId;
    }

    private String resolveErrorMessage(Exception exception) {
        if (exception instanceof ResponseStatusException responseStatusException
                && !isBlank(responseStatusException.getReason())) {
            return responseStatusException.getReason();
        }
        if (!isBlank(exception.getMessage())) {
            return exception.getMessage();
        }
        return "Sync failed";
    }

    private void markSyncRunning(ConnectedAccount account, OffsetDateTime startedAt) {
        account.setLastSyncStatus(SYNC_STATUS_RUNNING);
        account.setLastSyncError(null);
        account.setLastSyncStartedAt(startedAt);
        account.setLastSyncCompletedAt(null);
        account.setLastSyncImportedCount(0);
        account.setLastSyncLinkedCount(0);
        account.setUpdatedAt(startedAt);
    }

    private void markSyncSuccess(
            ConnectedAccount account,
            OffsetDateTime completedAt,
            int importedCount,
            int linkedCount) {
        account.setLastSyncStatus(SYNC_STATUS_SUCCESS);
        account.setLastSyncError(null);
        account.setLastSyncCompletedAt(completedAt);
        account.setLastSyncedAt(completedAt);
        account.setLastSyncImportedCount(importedCount);
        account.setLastSyncLinkedCount(linkedCount);
        account.setUpdatedAt(completedAt);
    }

    private void markSyncFailed(
            ConnectedAccount account,
            OffsetDateTime completedAt,
            String error) {
        account.setLastSyncStatus(SYNC_STATUS_FAILED);
        account.setLastSyncError(error);
        account.setLastSyncCompletedAt(completedAt);
        account.setLastSyncImportedCount(0);
        account.setLastSyncLinkedCount(0);
        account.setUpdatedAt(completedAt);
    }

    private boolean isTokenFailure(Exception exception) {
        if (!(exception instanceof ResponseStatusException responseStatusException)) {
            return false;
        }

        return responseStatusException.getStatusCode() == HttpStatus.UNAUTHORIZED
                || responseStatusException.getStatusCode() == HttpStatus.FORBIDDEN;
    }

    private int safeCount(Integer value) {
        return value == null ? 0 : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    /**
     * Logs current deterministic summary score after sync completion.
     */
    private void logFinalScoreSnapshot(UUID profileId, String provider) {
        try {
            VerificationSummaryDTO summary = skillVerificationSummaryService
                    .getSkillVerificationSummary(profileId);

            logSync(
                    "Connection sync score snapshot profileId="
                            + profileId
                            + " provider="
                            + provider
                            + " overallScore="
                            + summary.getOverallScore()
                            + " totalSkills="
                            + summary.getTotalSkills()
                            + " matchedSkills="
                            + summary.getMatchedSkills()
                            + " unmatchedSkills="
                            + summary.getUnmatchedSkills()
                            + " generatedAt="
                            + summary.getGeneratedAt());
        } catch (Exception exception) {
            logSync(
                    "Connection sync score snapshot failed profileId="
                            + profileId
                            + " provider="
                            + provider
                            + " reason="
                            + exception.getMessage());
        }
    }

    /**
     * Formats repository names for readable sync logging.
     */
    private String formatRepoNamesForLog(List<String> repositoryNames) {
        if (repositoryNames == null || repositoryNames.isEmpty()) {
            return "[]";
        }

        List<String> cleaned = repositoryNames.stream()
                .filter(name -> !isBlank(name))
                .distinct()
                .toList();

        if (cleaned.isEmpty()) {
            return "[]";
        }

        return cleaned.toString();
    }

    private int resolveEvidenceAgeDays(
            OffsetDateTime occurredAt,
            OffsetDateTime capturedAt,
            OffsetDateTime asOf
    ) {
        OffsetDateTime signalTimestamp = occurredAt != null ? occurredAt : capturedAt;
        if (signalTimestamp == null || asOf == null) {
            return 0;
        }

        long ageDays = Duration.between(signalTimestamp, asOf).toDays();
        if (ageDays <= 0) {
            return 0;
        }
        if (ageDays > Integer.MAX_VALUE) {
            return Integer.MAX_VALUE;
        }
        return (int) ageDays;
    }

    private void logSync(String message) {
        log.info("[ConnectionSync] {}", message);
    }
}
