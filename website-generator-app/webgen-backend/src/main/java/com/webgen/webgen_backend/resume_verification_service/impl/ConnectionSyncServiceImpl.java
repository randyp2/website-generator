package com.webgen.webgen_backend.resume_verification_service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.dto.profile.verification.connection.SyncEvidenceStatsDTO;
import com.webgen.webgen_backend.dto.profile.verification.connection.SyncLinkStatsDTO;
import com.webgen.webgen_backend.dto.profile.verification.connection.SyncProviderResponseDTO;
import com.webgen.webgen_backend.entity.Claim;
import com.webgen.webgen_backend.entity.ClaimEvidenceLink;
import com.webgen.webgen_backend.entity.ConnectedAccount;
import com.webgen.webgen_backend.entity.Evidence;
import com.webgen.webgen_backend.entity.Skill;
import com.webgen.webgen_backend.repository.ClaimEvidenceLinkRepository;
import com.webgen.webgen_backend.repository.ClaimRepository;
import com.webgen.webgen_backend.repository.ConnectedAccountRepository;
import com.webgen.webgen_backend.repository.EvidenceRepository;
import com.webgen.webgen_backend.repository.SkillRepository;
import com.webgen.webgen_backend.resume_verification_service.ConnectionSyncService;
import com.webgen.webgen_backend.resume_verification_service.provider.github.model.GithubContentResponse;
import com.webgen.webgen_backend.resume_verification_service.provider.github.model.GithubRepoResponse;
import com.webgen.webgen_backend.resume_verification_service.provider.github.model.GithubTokenResponse;
import com.webgen.webgen_backend.resume_verification_service.provider.github.model.GithubUserResponse;
import com.webgen.webgen_backend.resume_verification_service.shared.ProviderNormalizationHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
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

    private static final String GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
    private static final String GITHUB_USER_URL = "https://api.github.com/user";
    private static final String GITHUB_REPOS_URL = "https://api.github.com/user/repos";
    private static final String GITHUB_API_VERSION = "2022-11-28";

    private static final int GITHUB_REPOS_PER_PAGE = 100;
    private static final int MAX_GITHUB_REPO_PAGES = 5;
    private static final int MAX_REPOS_WITH_PACKAGE_SCAN = 30;

    private static final long TOKEN_EXPIRY_SKEW_SECONDS = 60L;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private static final List<String> PACKAGE_DEPENDENCY_SECTIONS = List.of(
            "dependencies",
            "devDependencies",
            "peerDependencies",
            "optionalDependencies");

    private static final Map<String, Set<String>> COMMON_TERM_ALIASES = Map.ofEntries(
            Map.entry("react", Set.of("reactjs")),
            Map.entry("reactjs", Set.of("react")),
            Map.entry("node.js", Set.of("nodejs")),
            Map.entry("nodejs", Set.of("node.js")),
            Map.entry("next.js", Set.of("nextjs")),
            Map.entry("nextjs", Set.of("next.js")),
            Map.entry("c#", Set.of("csharp")),
            Map.entry("csharp", Set.of("c#")),
            Map.entry("c++", Set.of("cpp")),
            Map.entry("cpp", Set.of("c++")),
            Map.entry(".net", Set.of("dotnet")),
            Map.entry("dotnet", Set.of(".net")));

    private final RestTemplate restTemplate = new RestTemplate();

    private final ConnectedAccountRepository connectedAccountRepository;
    private final EvidenceRepository evidenceRepository;
    private final ClaimRepository claimRepository;
    private final ClaimEvidenceLinkRepository claimEvidenceLinkRepository;
    private final SkillRepository skillRepository;
    private final ObjectMapper objectMapper;

    @Value("${github.oauth.client-id:}")
    private String githubOauthClientId;

    @Value("${github.oauth.client-secret:}")
    private String githubOauthClientSecret;

    @Value("${github.oauth.token-encryption-secret:}")
    private String githubOauthTokenEncryptionSecret;

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

        try {

            boolean tokenRefreshed = ensureValidAccessTokenForSync(
                    account,
                    normalizedProvider,
                    startedAt);

            String accessToken = decryptRequiredToken(
                    account.getAccessTokenEncrypted(),
                    "access token");

            ProviderSyncSnapshot snapshot = fetchGithubEvidenceSnapshot(
                    accessToken,
                    startedAt);

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

            SyncLinkStatsDTO linkStats = linkEvidenceToClaims(
                    profileId,
                    normalizedProvider,
                    upsertResult.persistedEvidence(),
                    startedAt);

            OffsetDateTime completedAt = OffsetDateTime.now();
            int importedCount = safeCount(evidenceStats.getInserted())
                    + safeCount(evidenceStats.getUpdated());
            int linkedCount = safeCount(linkStats.getInserted())
                    + safeCount(linkStats.getUpdated());

            markSyncSuccess(account, completedAt, importedCount, linkedCount);
            connectedAccountRepository.save(account);

            return SyncProviderResponseDTO.builder()
                    .provider(normalizedProvider)
                    .syncStatus(SYNC_STATUS_SUCCESS)
                    .startedAt(startedAt)
                    .completedAt(completedAt)
                    .tokenRefreshed(tokenRefreshed)
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
        GithubUserResponse profile = fetchGithubUserProfile(accessToken);
        List<GithubRepoResponse> repositories = fetchGithubRepositories(accessToken);

        List<EvidenceCandidate> candidates = new ArrayList<>();
        candidates.add(buildGithubProfileCandidate(profile, capturedAt));

        int dependencyScans = 0;
        for (GithubRepoResponse repo : repositories) {
            Set<String> dependencies = Set.of();
            if (dependencyScans < MAX_REPOS_WITH_PACKAGE_SCAN) {
                dependencies = fetchGithubPackageDependencies(
                        accessToken,
                        repo.fullName(),
                        repo.defaultBranch());
                dependencyScans++;
            }

            EvidenceCandidate candidate = buildGithubRepoCandidate(
                    repo,
                    dependencies,
                    capturedAt);
            if (candidate != null)
                candidates.add(candidate);

        }

        return new ProviderSyncSnapshot(candidates);
    }

    /** Fetches the authenticated GitHub user profile for profile evidence. */
    private GithubUserResponse fetchGithubUserProfile(String accessToken) {
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

    /**
     * Fetches owned repositories from GitHub with bounded pagination.
     */
    private List<GithubRepoResponse> fetchGithubRepositories(String accessToken) {
        List<GithubRepoResponse> results = new ArrayList<>();

        for (int page = 1; page <= MAX_GITHUB_REPO_PAGES; page++) {

            // Query parameters reasoning:
            // 1) type=owner -> only care about personally owned portfolios
            // forks, and orgs repos are low signal of ownership
            //
            // 2) sort=updated&direction=desc -> Recently created repositories reflect
            // users current skills.
            //
            // 3) Offset based pagination query parameters
            String url = UriComponentsBuilder.fromUriString(GITHUB_REPOS_URL)
                    .queryParam("type", "owner")
                    .queryParam("sort", "updated")
                    .queryParam("direction", "desc")
                    .queryParam("per_page", GITHUB_REPOS_PER_PAGE)
                    .queryParam("page", page)
                    .build()
                    .toUriString();

            try {
                // Fetch repositories and store into array
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
     * Best-effort dependency fetch from repository package.json.
     *
     * Missing package.json or parse issues are treated as no dependency signal.
     */
    private Set<String> fetchGithubPackageDependencies(
            String accessToken,
            String fullName,
            String defaultBranch) {
        if (isBlank(fullName) || !fullName.contains("/")) {
            return Set.of();
        }

        String[] parts = fullName.split("/", 2);
        if (parts.length != 2 || isBlank(parts[0]) || isBlank(parts[1])) {
            return Set.of();
        }

        String url = UriComponentsBuilder
                .fromUriString("https://api.github.com/repos/{owner}/{repo}/contents/package.json")
                .queryParam("ref", isBlank(defaultBranch) ? "main" : defaultBranch)
                .buildAndExpand(parts[0], parts[1])
                .toUriString();

        try {
            ResponseEntity<GithubContentResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(buildGithubApiHeaders(accessToken)),
                    GithubContentResponse.class);

            GithubContentResponse body = response.getBody();
            if (body == null || isBlank(body.content())) {
                return Set.of();
            }

            if (!"base64".equalsIgnoreCase(body.encoding())) {
                return Set.of();
            }

            byte[] decoded = Base64.getDecoder().decode(
                    body.content().replace("\n", ""));
            JsonNode packageJson = objectMapper.readTree(decoded);
            return extractDependenciesFromPackageJson(packageJson);
        } catch (RestClientResponseException exception) {
            // package.json is optional; treat 404 as no dependency signal.
            if (exception.getStatusCode() == HttpStatus.NOT_FOUND) {
                return Set.of();
            }
            if (exception.getStatusCode() == HttpStatus.UNAUTHORIZED
                    || exception.getStatusCode() == HttpStatus.FORBIDDEN) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "GitHub package fetch unauthorized. Reconnect is required.",
                        exception);
            }
            return Set.of();
        } catch (Exception exception) {
            return Set.of();
        }
    }

    // Reads dependency keys from standard package.json dependency sections.
    private Set<String> extractDependenciesFromPackageJson(JsonNode packageJson) {
        if (packageJson == null || !packageJson.isObject()) {
            return Set.of();
        }

        Set<String> dependencies = new LinkedHashSet<>();
        for (String section : PACKAGE_DEPENDENCY_SECTIONS) {
            JsonNode node = packageJson.get(section);
            if (node == null || !node.isObject()) {
                continue;
            }

            node.fieldNames().forEachRemaining(
                    dep -> addMatchingTerm(dependencies, dep));
        }

        return dependencies;
    }

    // Builds one normalized profile evidence candidate from GitHub user payload.
    private EvidenceCandidate buildGithubProfileCandidate(
            GithubUserResponse profile,
            OffsetDateTime capturedAt) {

        ObjectNode metadata = objectMapper.createObjectNode();
        metadata.put("kind", "profile");

        if (profile.login() != null)
            metadata.put("login", profile.login());

        if (profile.name() != null)
            metadata.put("name", profile.name());

        if (profile.bio() != null)
            metadata.put("bio", profile.bio());

        String externalId = "profile:" + profile.id();
        String title = isBlank(profile.name()) ? profile.login() : profile.name();

        return new EvidenceCandidate(
                externalId,
                "profile",
                title,
                profile.bio(),
                profile.htmlUrl(),
                parseOffsetDateTimeOrNull(profile.updatedAt()),
                capturedAt,
                metadata);
    }

    // Builds one normalized repository evidence candidate from GitHub repo payload.
    private EvidenceCandidate buildGithubRepoCandidate(
            GithubRepoResponse repo,
            Set<String> dependencies,
            OffsetDateTime capturedAt) {
        if (repo == null || isBlank(repo.fullName())) {
            return null;
        }

        ObjectNode metadata = objectMapper.createObjectNode();
        metadata.put("kind", "repository");
        metadata.put("full_name", repo.fullName());
        metadata.put("repo_name", repo.name());
        if (repo.description() != null) {
            metadata.put("description", repo.description());
        }
        if (repo.primaryLanguage() != null) {
            metadata.put("primary_language", repo.primaryLanguage());
        }
        if (repo.pushedAt() != null) {
            metadata.put("pushed_at", repo.pushedAt());
        }

        ArrayNode topicsArray = metadata.putArray("topics");
        if (repo.topics() != null) {
            repo.topics().forEach(topicsArray::add);
        }

        ArrayNode dependenciesArray = metadata.putArray("dependencies");
        dependencies.stream().sorted().forEach(dependenciesArray::add);

        return new EvidenceCandidate(
                "repo:" + repo.fullName().toLowerCase(Locale.ROOT),
                "repository",
                repo.fullName(),
                repo.description(),
                repo.htmlUrl(),
                parseOffsetDateTimeOrNull(repo.pushedAt()),
                capturedAt,
                metadata);
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

            ClaimTermSet termSet = buildClaimTermSet(
                    claim.getRawValue(),
                    canonicalName,
                    aliases);

            if (termSet.terms().isEmpty()) {
                continue;
            }

            for (Evidence evidence : currentRunEvidence) {
                MatchResult match = evaluateEvidenceMatch(termSet, evidence);
                if (!match.matched()) {
                    continue;
                }

                matchedClaimIds.add(claim.getId());
                String key = linkKey(claim.getId(), evidence.getId());
                matchedKeys.add(key);

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

    /**
     * Builds the deterministic claim term set from raw value, canonical name, DB aliases,
     * and common hardcoded alias expansions.
     */
    private ClaimTermSet buildClaimTermSet(
            String rawValue,
            String canonicalName,
            List<String> aliases) {
        Set<String> terms = new LinkedHashSet<>();

        addMatchingTerm(terms, rawValue);
        addMatchingTerm(terms, canonicalName);
        aliases.forEach(alias -> addMatchingTerm(terms, alias));

        // Expand common ecosystem aliases so deterministic matching catches
        // prevalent naming variants (for example react <-> reactjs).
        Set<String> expanded = new LinkedHashSet<>(terms);
        for (String term : terms) {
            if (COMMON_TERM_ALIASES.containsKey(term)) {
                COMMON_TERM_ALIASES.get(term)
                        .forEach(alias -> addMatchingTerm(expanded, alias));
            }
        }

        return new ClaimTermSet(expanded);
    }

    /** Normalizes and appends one match term when the token is valid for matching. */
    private void addMatchingTerm(Set<String> out, String raw) {
        String normalized = normalizeForMatch(raw);
        if (isBlank(normalized)) {
            return;
        }

        if (normalized.length() >= 2) {
            out.add(normalized);
        }
    }

    /**
     * Evaluates one claim term set against one evidence row using deterministic rule precedence.
     *
     * Rule order: dependency > topic > repo name > description, then optional language boost.
     * Only repository evidence is considered in this phase.
     */
    private MatchResult evaluateEvidenceMatch(ClaimTermSet termSet, Evidence evidence) {
        if (!"repository".equalsIgnoreCase(evidence.getEvidenceType())) {
            return MatchResult.noMatch();
        }

        JsonNode metadata = evidence.getMetadata();
        List<String> topics = readNormalizedArray(metadata, "topics");
        List<String> dependencies = readNormalizedArray(metadata, "dependencies");
        String repoName = normalizeForMatch(readText(metadata, "repo_name"));
        String fullName = normalizeForMatch(readText(metadata, "full_name"));
        String description = normalizeForMatch(evidence.getDescription());
        String primaryLanguage = normalizeForMatch(readText(metadata, "primary_language"));

        MatchResult best = MatchResult.noMatch();

        for (String term : termSet.terms()) {
            if (containsTermInCollection(dependencies, term)) {
                return buildMatch(
                        "dependency_match",
                        BigDecimal.valueOf(0.95),
                        "Dependency signal matched: " + term,
                        term,
                        "dependency");
            }

            if (containsTermInCollection(topics, term)) {
                best = maxMatch(
                        best,
                        buildMatch(
                                "topic_match",
                                BigDecimal.valueOf(0.85),
                                "Topic signal matched: " + term,
                                term,
                                "topic"));
            }

            if (containsTerm(repoName, term) || containsTerm(fullName, term)) {
                best = maxMatch(
                        best,
                        buildMatch(
                                "name_match",
                                BigDecimal.valueOf(0.78),
                                "Repository name matched: " + term,
                                term,
                                "name"));
            }

            if (containsTerm(description, term)) {
                best = maxMatch(
                        best,
                        buildMatch(
                                "description_match",
                                BigDecimal.valueOf(0.70),
                                "Repository description matched: " + term,
                                term,
                                "description"));
            }
        }

        // Language-only is intentionally weak and should not auto-link by itself.
        // Require supporting text/topic signal before creating a language-assisted
        // link.
        if (!isBlank(primaryLanguage)
                && termSet.terms().contains(primaryLanguage)
                && best.matched()) {
            best = maxMatch(
                    best,
                    buildMatch(
                            "language_plus_text_match",
                            BigDecimal.valueOf(0.55),
                            "Language matched with supporting repository signal",
                            primaryLanguage,
                            "language"));
        }

        return best;
    }

    /** Returns the higher-confidence match while handling unmatched sentinels. */
    private MatchResult maxMatch(MatchResult left, MatchResult right) {
        if (!left.matched()) {
            return right;
        }
        if (!right.matched()) {
            return left;
        }
        return right.confidence().compareTo(left.confidence()) > 0 ? right : left;
    }

    /** Creates a normalized match payload used for claim_evidence_links persistence. */
    private MatchResult buildMatch(
            String linkType,
            BigDecimal confidence,
            String reason,
            String matchedTerm,
            String signal) {
        ObjectNode metadata = objectMapper.createObjectNode();
        metadata.put("matched_term", matchedTerm);
        metadata.put("signal", signal);

        return new MatchResult(true, linkType, confidence, reason, metadata);
    }

    /** Applies match fields to an existing link and returns whether any persisted field changed. */
    private boolean applyMatchToLink(
            ClaimEvidenceLink link,
            MatchResult match,
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

    /** Returns true when any normalized value in the collection contains the target term. */
    private boolean containsTermInCollection(List<String> values, String term) {
        for (String value : values) {
            if (containsTerm(value, term)) {
                return true;
            }
        }
        return false;
    }

    /** Performs normalized substring containment check used by deterministic match rules. */
    private boolean containsTerm(String haystack, String term) {
        return !isBlank(haystack) && !isBlank(term) && haystack.contains(term);
    }

    /** Reads and normalizes a string array field from evidence metadata. */
    private List<String> readNormalizedArray(JsonNode metadata, String field) {
        if (metadata == null || !metadata.has(field) || !metadata.get(field).isArray()) {
            return List.of();
        }

        List<String> values = new ArrayList<>();
        for (JsonNode node : metadata.get(field)) {
            if (!node.isTextual()) {
                continue;
            }
            String normalized = normalizeForMatch(node.asText());
            if (!isBlank(normalized)) {
                values.add(normalized);
            }
        }
        return values;
    }

    /** Reads one nullable string field from JSON metadata. */
    private String readText(JsonNode node, String field) {
        if (node == null || !node.has(field) || node.get(field).isNull()) {
            return null;
        }
        return node.get(field).asText(null);
    }

    // Standard auth and API-version headers for GitHub REST requests.
    private HttpHeaders buildGithubApiHeaders(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("X-GitHub-Api-Version", GITHUB_API_VERSION);
        headers.set("Accept", "application/vnd.github+json");
        return headers;
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

    private OffsetDateTime parseOffsetDateTimeOrNull(String value) {
        if (isBlank(value)) {
            return null;
        }

        try {
            return OffsetDateTime.parse(value);
        } catch (DateTimeParseException ignored) {
            return null;
        }
    }

    /** Normalizes free text into a comparable token space for deterministic matching. */
    private String normalizeForMatch(String value) {
        if (isBlank(value)) {
            return "";
        }

        return value
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9+#.]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
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

    /**
     * Ensures a usable access token exists for the current sync run.
     *
     * Flow:
     * 1) validates/decrypts stored access token format
     * 2) returns immediately when access token is not expired (with safety skew)
     * 3) refreshes through provider API when expired
     * 4) persists refreshed token/scopes/expiry fields back on the account entity
     *
     * Throws {@link ResponseStatusException} with UNAUTHORIZED when
     * reconnect is required (missing/invalid/expired refresh token).
     *
     * @param account  connected account row to validate/update
     * @param provider normalized provider key
     * @param now      sync start timestamp used for expiry calculations
     * @return true when a refresh was performed, otherwise false
     */
    private boolean ensureValidAccessTokenForSync(
            ConnectedAccount account,
            String provider,
            OffsetDateTime now) {
        if (!PROVIDER_GITHUB.equals(provider)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_IMPLEMENTED,
                    "Token flow is not implemented for provider: " + provider);
        }

        decryptRequiredToken(account.getAccessTokenEncrypted(), "access token");

        if (!isExpiredWithSkew(account.getAccessTokenExpiresAt(), now)) {
            return false;
        }

        if (isExpiredWithSkew(account.getRefreshTokenExpiresAt(), now)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Provider refresh token is expired. Reconnect is required.");
        }

        validateGithubRefreshConfiguration();
        String refreshToken = decryptRequiredToken(
                account.getRefreshTokenEncrypted(),
                "refresh token");

        GithubTokenResponse refreshed = refreshGithubAccessToken(refreshToken);
        applyGithubRefreshResult(account, refreshed, now);
        return true;
    }

    /**
     * Calls GitHub's OAuth token endpoint using refresh-token grant flow.
     *
     * Maps auth-related provider failures to UNAUTHORIZED so the
     * caller can transition account state to reconnect-required UX.
     *
     * @param refreshToken decrypted refresh token
     * @return provider token payload containing a new access token
     */
    private GithubTokenResponse refreshGithubAccessToken(String refreshToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("client_id", githubOauthClientId);
        formData.add("client_secret", githubOauthClientSecret);
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

    /**
     * Applies refreshed GitHub OAuth fields to the connected account entity.
     *
     * Updates access token every time, refresh token only when provider
     * rotates it, and adjusts expiry/scopes when present in response.
     *
     * @param account   mutable connected account entity
     * @param refreshed refresh response payload from GitHub
     * @param now       base timestamp used to compute absolute expiry values
     */
    private void applyGithubRefreshResult(
            ConnectedAccount account,
            GithubTokenResponse refreshed,
            OffsetDateTime now) {
        account.setAccessTokenEncrypted(encryptToken(refreshed.accessToken()));
        if (!isBlank(refreshed.refreshToken())) {
            account.setRefreshTokenEncrypted(encryptToken(refreshed.refreshToken()));
        }

        account.setAccessTokenExpiresAt(resolveExpiry(now, refreshed.expiresIn()));
        if (refreshed.refreshTokenExpiresIn() != null) {
            account.setRefreshTokenExpiresAt(
                    resolveExpiry(now, refreshed.refreshTokenExpiresIn()));
        }

        if (!isBlank(refreshed.scope())) {
            account.setScopes(parseScopes(refreshed.scope()));
        }
    }

    /**
     * Validates minimum GitHub OAuth configuration required for refresh flow.
     */
    private void validateGithubRefreshConfiguration() {
        if (isBlank(githubOauthClientId) || isBlank(githubOauthClientSecret)) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "GitHub token refresh is not configured");
        }
    }

    /**
     * Returns whether a token should be treated as expired using a small skew
     * window.
     */
    private boolean isExpiredWithSkew(OffsetDateTime expiresAt, OffsetDateTime now) {
        if (expiresAt == null) {
            return false;
        }

        return !expiresAt.isAfter(now.plusSeconds(TOKEN_EXPIRY_SKEW_SECONDS));
    }

    /**
     * Decrypts a required encrypted token field and raises reconnect-required
     * errors when missing.
     *
     * @param encryptedToken encrypted token payload from persistence
     * @param label          human-readable token label for error messages
     * @return decrypted plaintext token
     */
    private String decryptRequiredToken(String encryptedToken, String label) {
        if (isBlank(encryptedToken)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Missing provider " + label + ". Reconnect is required.");
        }

        try {
            String[] parts = encryptedToken.split(":", 2);
            if (parts.length != 2) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Stored provider token format is invalid. Reconnect is required.");
            }

            byte[] iv = Base64.getDecoder().decode(parts[0]);
            byte[] cipherText = Base64.getDecoder().decode(parts[1]);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec gcmSpec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.DECRYPT_MODE, deriveEncryptionKey(), gcmSpec);

            byte[] decrypted = cipher.doFinal(cipherText);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Failed to decrypt provider token. Reconnect is required.",
                    exception);
        }
    }

    /**
     * Encrypts token value using the same AES/GCM format used in OAuth callback
     * flow.
     *
     * @param token plaintext provider token
     * @return encoded token as <base64(iv)>:<base64(ciphertext)>
     */
    private String encryptToken(String token) {
        try {
            byte[] iv = new byte[12];
            SECURE_RANDOM.nextBytes(iv);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec gcmSpec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.ENCRYPT_MODE, deriveEncryptionKey(), gcmSpec);

            byte[] encrypted = cipher.doFinal(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(iv)
                    + ":"
                    + Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to encrypt provider token",
                    exception);
        }
    }

    /**
     * Derives a deterministic AES key from configured secret material.
     */
    private SecretKeySpec deriveEncryptionKey() throws Exception {
        if (isBlank(githubOauthTokenEncryptionSecret)) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Provider token encryption secret is not configured");
        }

        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] keyBytes = digest.digest(
                githubOauthTokenEncryptionSecret.getBytes(StandardCharsets.UTF_8));
        return new SecretKeySpec(keyBytes, "AES");
    }

    /**
     * Converts provider relative expiry seconds to absolute timestamp.
     */
    private OffsetDateTime resolveExpiry(OffsetDateTime now, Long expiresInSeconds) {
        if (expiresInSeconds == null || expiresInSeconds <= 0) {
            return null;
        }
        return now.plusSeconds(expiresInSeconds);
    }

    /**
     * Normalizes comma/space-delimited scope payload to a deduplicated array.
     */
    private String[] parseScopes(String scopePayload) {
        if (isBlank(scopePayload)) {
            return new String[0];
        }

        return Arrays.stream(scopePayload.split("[,\\s]+"))
                .map(String::trim)
                .filter(scope -> !scope.isBlank())
                .distinct()
                .toArray(String[]::new);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record EvidenceCandidate(
            String externalId,
            String evidenceType,
            String title,
            String description,
            String sourceUrl,
            OffsetDateTime occurredAt,
            OffsetDateTime capturedAt,
            JsonNode metadata) {
    }

    private record ProviderSyncSnapshot(
            List<EvidenceCandidate> candidates) {
    }

    private record EvidenceUpsertResult(
            int inserted,
            int updated,
            int unchanged,
            List<Evidence> persistedEvidence) {
    }

    private record ClaimTermSet(
            Set<String> terms) {
    }

    private record MatchResult(
            boolean matched,
            String linkType,
            BigDecimal confidence,
            String reason,
            JsonNode metadata) {
        static MatchResult noMatch() {
            return new MatchResult(
                    false,
                    null,
                    BigDecimal.ZERO,
                    null,
                    null);
        }
    }
}
