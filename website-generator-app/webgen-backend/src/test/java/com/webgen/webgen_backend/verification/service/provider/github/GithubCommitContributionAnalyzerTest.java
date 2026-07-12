package com.webgen.webgen_backend.verification.service.provider.github;

import com.webgen.webgen_backend.verification.service.provider.github.model.GithubAuthorshipSignal;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubCommitResponse;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

class GithubCommitContributionAnalyzerTest {

    private final GithubCommitContributionAnalyzer analyzer =
            new GithubCommitContributionAnalyzer();

    @Test
    void rewardsFiveDirectCommitsAcrossMultipleDays() {
        GithubAuthorshipSignal signal = analyzer.assess(List.of(
                directCommit("one", "2026-07-10T10:00:00Z"),
                directCommit("two", "2026-07-10T11:00:00Z"),
                directCommit("three", "2026-07-11T10:00:00Z"),
                directCommit("four", "2026-07-11T11:00:00Z"),
                directCommit("five", "2026-07-11T12:00:00Z")), false);

        assertThat(signal.directCommitCount()).isEqualTo(5);
        assertThat(signal.activeDayCount()).isEqualTo(2);
        assertThat(signal.weight()).isEqualByComparingTo("1.00");
    }

    @Test
    void discountsDirectCommitsConcentratedOnOneDay() {
        GithubAuthorshipSignal signal = analyzer.assess(List.of(
                directCommit("one", "2026-07-10T10:00:00Z"),
                directCommit("two", "2026-07-10T11:00:00Z"),
                directCommit("three", "2026-07-10T12:00:00Z")), false);

        assertThat(signal.activeDayCount()).isEqualTo(1);
        assertThat(signal.weight()).isEqualByComparingTo("0.85");
    }

    @Test
    void givesMergeOnlyActivityPartialCredit() {
        List<GithubCommitResponse> merges = List.of(
                mergeCommit("merge-one", "2026-07-10T10:00:00Z"),
                mergeCommit("merge-two", "2026-07-11T10:00:00Z"));

        GithubAuthorshipSignal owned = analyzer.assess(merges, false);
        GithubAuthorshipSignal fork = analyzer.assess(merges, true);

        assertThat(owned.directCommitCount()).isZero();
        assertThat(owned.mergeCommitCount()).isEqualTo(2);
        assertThat(owned.weight()).isEqualByComparingTo("0.65");
        assertThat(fork.weight()).isEqualByComparingTo("0.45");
    }

    private GithubCommitResponse directCommit(String sha, String date) {
        return commit(sha, date, 1);
    }

    private GithubCommitResponse mergeCommit(String sha, String date) {
        return commit(sha, date, 2);
    }

    private GithubCommitResponse commit(String sha, String date, int parentCount) {
        List<GithubCommitResponse.Parent> parents = IntStream.range(0, parentCount)
                .mapToObj(index -> new GithubCommitResponse.Parent("parent-" + index))
                .toList();
        return new GithubCommitResponse(
                sha,
                new GithubCommitResponse.CommitDetails(
                        new GithubCommitResponse.GitIdentity(date),
                        new GithubCommitResponse.GitIdentity(date)),
                parents);
    }
}
