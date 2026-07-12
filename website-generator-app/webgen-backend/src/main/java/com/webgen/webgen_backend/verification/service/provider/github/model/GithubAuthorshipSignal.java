package com.webgen.webgen_backend.verification.service.provider.github.model;

import java.math.BigDecimal;

/** Repository authorship assessment persisted with GitHub evidence provenance. */
public record GithubAuthorshipSignal(
        Status status,
        int authoredCommitCount,
        BigDecimal weight,
        String reason
) {
    private static final BigDecimal FULL_WEIGHT = BigDecimal.ONE;
    private static final BigDecimal MULTIPLE_COMMITS_WEIGHT = new BigDecimal("0.90");
    private static final BigDecimal SINGLE_COMMIT_WEIGHT = new BigDecimal("0.75");
    private static final BigDecimal NO_COMMITS_OWNED_WEIGHT = new BigDecimal("0.60");
    private static final BigDecimal NO_COMMITS_FORK_WEIGHT = new BigDecimal("0.30");

    public static GithubAuthorshipSignal assessed(int authoredCommitCount, boolean fork) {
        int boundedCount = Math.max(0, authoredCommitCount);
        if (boundedCount >= 5) {
            return new GithubAuthorshipSignal(
                    Status.CONFIRMED, boundedCount, FULL_WEIGHT, "five_or_more_authored_commits");
        }
        if (boundedCount >= 2) {
            return new GithubAuthorshipSignal(
                    Status.CONFIRMED, boundedCount, MULTIPLE_COMMITS_WEIGHT, "multiple_authored_commits");
        }
        if (boundedCount == 1) {
            return new GithubAuthorshipSignal(
                    Status.CONFIRMED, boundedCount, SINGLE_COMMIT_WEIGHT, "single_authored_commit");
        }
        return new GithubAuthorshipSignal(
                Status.NO_MATCH,
                0,
                fork ? NO_COMMITS_FORK_WEIGHT : NO_COMMITS_OWNED_WEIGHT,
                fork ? "no_authored_commits_on_fork" : "no_authored_commits_on_owned_repository");
    }

    /** Keeps current score strength when GitHub cannot provide a fair assessment. */
    public static GithubAuthorshipSignal unavailable(String reason) {
        return new GithubAuthorshipSignal(
                Status.UNAVAILABLE, 0, FULL_WEIGHT, reason == null ? "unavailable" : reason);
    }

    public enum Status {
        CONFIRMED,
        NO_MATCH,
        UNAVAILABLE
    }
}
