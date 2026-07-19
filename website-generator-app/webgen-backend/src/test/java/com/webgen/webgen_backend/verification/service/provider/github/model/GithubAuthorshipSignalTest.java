package com.webgen.webgen_backend.verification.service.provider.github.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class GithubAuthorshipSignalTest {

    @Test
    void appliesGradualCommitCountWeights() {
        assertThat(GithubAuthorshipSignal.assessed(5, false).weight())
                .isEqualByComparingTo("1.00");
        assertThat(GithubAuthorshipSignal.assessed(2, false).weight())
                .isEqualByComparingTo("0.90");
        assertThat(GithubAuthorshipSignal.assessed(1, false).weight())
                .isEqualByComparingTo("0.75");
        assertThat(GithubAuthorshipSignal.assessed(0, false).weight())
                .isEqualByComparingTo("0.60");
        assertThat(GithubAuthorshipSignal.assessed(0, true).weight())
                .isEqualByComparingTo("0.30");
    }

    @Test
    void unavailableDataPreservesExistingStrength() {
        GithubAuthorshipSignal signal = GithubAuthorshipSignal.unavailable("rate_limit");

        assertThat(signal.status()).isEqualTo(GithubAuthorshipSignal.Status.UNAVAILABLE);
        assertThat(signal.weight()).isEqualByComparingTo("1.00");
    }
}
