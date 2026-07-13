package com.webgen.webgen_backend.verification.service.shared;

import com.fasterxml.jackson.databind.JsonNode;
import com.webgen.webgen_backend.verification.entity.ClaimEvidenceUpload;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubRepoResponse;
import org.springframework.stereotype.Component;

import java.util.Locale;

import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.isBlank;

/** Builds stable identities used to collapse correlated evidence before scoring. */
@Component
public class EvidenceGroupKeyFactory {

    private static final String VERIFIED_OBJECT_METADATA = "verifiedObject";

    public String forGithubProfile(Long profileId, String externalId) {
        return profileId == null
                ? fallback("github", externalId)
                : "github:profile:" + profileId;
    }

    public String forGithubRepository(GithubRepoResponse repository, String externalId) {
        if (repository == null) {
            return fallback("github", externalId);
        }

        GithubRepoResponse.RepositoryIdentity root = repository.source() != null
                ? repository.source()
                : repository.parent();
        Long rootId = root != null ? root.id() : repository.id();
        if (rootId != null) {
            return "github:repository:" + rootId;
        }

        return fallback("github", externalId);
    }

    /** Returns the physical repository identity when source comparison is available. */
    public String forGithubRepositoryInstance(
            GithubRepoResponse repository,
            String externalId
    ) {
        if (repository != null && repository.id() != null) {
            return "github:repository:" + repository.id();
        }
        return fallback("github", externalId);
    }

    public String forManualUpload(ClaimEvidenceUpload upload) {
        if (upload == null) {
            return fallback("manual_upload", null);
        }

        JsonNode identity = upload.getMetadata() == null
                ? null
                : upload.getMetadata().path(VERIFIED_OBJECT_METADATA);
        String checksum = text(identity, "checksumSha256");
        if (!isBlank(checksum)) {
            return "manual_upload:sha256:" + checksum;
        }

        String eTag = text(identity, "eTag");
        if (!isBlank(eTag)) {
            String contentLength = text(identity, "contentLength");
            return "manual_upload:etag:" + eTag
                    + (contentLength == null ? "" : ":" + contentLength);
        }

        return "manual_upload:upload:" + upload.getId();
    }

    public String fallback(String provider, String externalId) {
        String normalizedProvider = isBlank(provider)
                ? "unknown"
                : provider.trim().toLowerCase(Locale.ROOT);
        String normalizedExternalId = isBlank(externalId)
                ? "unknown"
                : externalId.trim().toLowerCase(Locale.ROOT);
        return normalizedProvider + ':' + normalizedExternalId;
    }

    private String text(JsonNode parent, String field) {
        if (parent == null || parent.isMissingNode() || parent.isNull()) {
            return null;
        }
        String value = parent.path(field).asText(null);
        return isBlank(value) ? null : value.trim();
    }
}
