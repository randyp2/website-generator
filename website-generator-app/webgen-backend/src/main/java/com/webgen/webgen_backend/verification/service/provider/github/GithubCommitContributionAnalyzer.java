package com.webgen.webgen_backend.verification.service.provider.github;

import com.webgen.webgen_backend.verification.service.provider.github.model.GithubAuthorshipSignal;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubCommitResponse;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/** Classifies user-attributed commits without attempting AI-use detection. */
@Component
public class GithubCommitContributionAnalyzer {

    public GithubAuthorshipSignal assess(
            List<GithubCommitResponse> commits,
            boolean fork
    ) {
        int directCommitCount = 0;
        int mergeCommitCount = 0;
        Set<LocalDate> activeDays = new HashSet<>();

        for (GithubCommitResponse commit : commits == null ? List.<GithubCommitResponse>of() : commits) {
            if (commit == null) {
                continue;
            }
            if (commit.parents() != null && commit.parents().size() > 1) {
                mergeCommitCount++;
                continue;
            }

            directCommitCount++;
            resolveContributionDate(commit).ifPresent(activeDays::add);
        }

        return GithubAuthorshipSignal.assessed(
                directCommitCount,
                mergeCommitCount,
                activeDays.size(),
                fork);
    }

    private Optional<LocalDate> resolveContributionDate(GithubCommitResponse commit) {
        if (commit.commit() == null) {
            return Optional.empty();
        }
        GithubCommitResponse.GitIdentity identity = commit.commit().committer() != null
                ? commit.commit().committer()
                : commit.commit().author();
        if (identity == null || identity.date() == null) {
            return Optional.empty();
        }
        try {
            return Optional.of(OffsetDateTime.parse(identity.date()).toLocalDate());
        } catch (DateTimeParseException exception) {
            return Optional.empty();
        }
    }
}
