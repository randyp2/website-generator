package com.webgen.webgen_backend.verification.service.provider.github.model;

import java.math.BigDecimal;

/** Repository authorship assessment persisted with GitHub evidence provenance. */
public record GithubAuthorshipSignal(
        Status status,
        int authoredCommitCount,
        int directCommitCount,
        int mergeCommitCount,
        int activeDayCount,
        BigDecimal weight,
        String reason
) {
    private static final BigDecimal FULL_WEIGHT = BigDecimal.ONE;
    private static final BigDecimal MULTIPLE_COMMITS_WEIGHT = new BigDecimal("0.90");
    private static final BigDecimal CONCENTRATED_COMMITS_WEIGHT = new BigDecimal("0.85");
    private static final BigDecimal SINGLE_COMMIT_WEIGHT = new BigDecimal("0.75");
    private static final BigDecimal MERGE_ONLY_OWNED_WEIGHT = new BigDecimal("0.65");
    private static final BigDecimal MERGE_ONLY_FORK_WEIGHT = new BigDecimal("0.45");
    private static final BigDecimal NO_COMMITS_OWNED_WEIGHT = new BigDecimal("0.60");
    private static final BigDecimal NO_COMMITS_FORK_WEIGHT = new BigDecimal("0.30");

    public static GithubAuthorshipSignal assessed(int authoredCommitCount, boolean fork) {
        int directCommitCount = Math.max(0, authoredCommitCount);
        int activeDayCount = directCommitCount >= 2 ? 2 : directCommitCount;
        return assessed(directCommitCount, 0, activeDayCount, fork);
    }

    public static GithubAuthorshipSignal assessed(
            int directCommitCount,
            int mergeCommitCount,
            int activeDayCount,
            boolean fork
    ) {
        int boundedDirectCount = Math.max(0, directCommitCount);
        int boundedMergeCount = Math.max(0, mergeCommitCount);
        int boundedActiveDays = Math.max(0, activeDayCount);
        int authoredCommitCount = boundedDirectCount + boundedMergeCount;

        if (boundedDirectCount >= 5 && boundedActiveDays >= 2) {
            return new GithubAuthorshipSignal(
                    Status.CONFIRMED, authoredCommitCount, boundedDirectCount,
                    boundedMergeCount, boundedActiveDays, FULL_WEIGHT,
                    "five_direct_commits_across_multiple_days");
        }
        if (boundedDirectCount >= 2 && boundedActiveDays >= 2) {
            return new GithubAuthorshipSignal(
                    Status.CONFIRMED, authoredCommitCount, boundedDirectCount,
                    boundedMergeCount, boundedActiveDays, MULTIPLE_COMMITS_WEIGHT,
                    "multiple_direct_commits_across_multiple_days");
        }
        if (boundedDirectCount >= 2) {
            return new GithubAuthorshipSignal(
                    Status.CONFIRMED, authoredCommitCount, boundedDirectCount,
                    boundedMergeCount, boundedActiveDays, CONCENTRATED_COMMITS_WEIGHT,
                    "multiple_direct_commits_on_one_day");
        }
        if (boundedDirectCount == 1) {
            return new GithubAuthorshipSignal(
                    Status.CONFIRMED, authoredCommitCount, boundedDirectCount,
                    boundedMergeCount, boundedActiveDays, SINGLE_COMMIT_WEIGHT,
                    "single_direct_commit");
        }
        if (boundedMergeCount > 0) {
            return new GithubAuthorshipSignal(
                    Status.CONFIRMED, authoredCommitCount, 0,
                    boundedMergeCount, 0,
                    fork ? MERGE_ONLY_FORK_WEIGHT : MERGE_ONLY_OWNED_WEIGHT,
                    fork ? "merge_only_activity_on_fork" : "merge_only_activity_on_owned_repository");
        }
        return new GithubAuthorshipSignal(
                Status.NO_MATCH,
                0,
                0,
                0,
                0,
                fork ? NO_COMMITS_FORK_WEIGHT : NO_COMMITS_OWNED_WEIGHT,
                fork ? "no_authored_commits_on_fork" : "no_authored_commits_on_owned_repository");
    }

    /** Keeps current score strength when GitHub cannot provide a fair assessment. */
    public static GithubAuthorshipSignal unavailable(String reason) {
        return new GithubAuthorshipSignal(
                Status.UNAVAILABLE, 0, 0, 0, 0, FULL_WEIGHT,
                reason == null ? "unavailable" : reason);
    }

    public enum Status {
        CONFIRMED,
        NO_MATCH,
        UNAVAILABLE
    }
}
