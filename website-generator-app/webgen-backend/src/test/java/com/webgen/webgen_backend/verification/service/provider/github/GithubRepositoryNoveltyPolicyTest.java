package com.webgen.webgen_backend.verification.service.provider.github;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class GithubRepositoryNoveltyPolicyTest {

    private final GithubRepositoryNoveltyPolicy policy = new GithubRepositoryNoveltyPolicy();

    @Test
    void keepsFullCreditForMostlyIndependentRepositories() {
        assertThat(policy.independenceWeight(0.0d)).isEqualByComparingTo("1.0000");
        assertThat(policy.independenceWeight(0.60d)).isEqualByComparingTo("1.0000");
    }

    @Test
    void decreasesCreditGraduallyWithoutEliminatingDerivativeQuantity() {
        assertThat(policy.independenceWeight(0.65d)).isEqualByComparingTo("0.8750");
        assertThat(policy.independenceWeight(0.70d)).isEqualByComparingTo("0.7500");
        assertThat(policy.independenceWeight(0.80d)).isEqualByComparingTo("0.5000");
        assertThat(policy.independenceWeight(0.85d)).isEqualByComparingTo("0.3750");
        assertThat(policy.independenceWeight(0.90d)).isEqualByComparingTo("0.2500");
    }

    @Test
    void keepsDivergedForkCreditSubstantialButConservative() {
        assertThat(policy.lineageIndependenceWeight(0.44d)).isEqualByComparingTo("0.8500");
        assertThat(policy.lineageIndependenceWeight(0.70d)).isEqualByComparingTo("0.7500");
        assertThat(policy.lineageIndependenceWeight(0.85d)).isEqualByComparingTo("0.3750");
    }
}
