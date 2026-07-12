package com.webgen.webgen_backend.verification.service.provider.github;

import com.webgen.webgen_backend.verification.service.provider.github.model.GithubAuthorshipSignal;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubRepoResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class GithubRepositoryInsightsClientTest {

    @Test
    void assessesAuthorshipFromBoundedAttributedCommitResponse() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        server.expect(once(), requestTo(
                        "https://api.github.com/repos/octo/app/commits?author=octocat&per_page=5"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("""
                        [
                          {"sha":"one","commit":{"author":{"date":"2026-07-10T12:00:00Z"}},
                           "parents":[{"sha":"parent-one"}]},
                          {"sha":"two","commit":{"author":{"date":"2026-07-11T12:00:00Z"}},
                           "parents":[{"sha":"parent-two"}]}
                        ]
                        """, MediaType.APPLICATION_JSON));
        GithubRepositoryInsightsClient client = new GithubRepositoryInsightsClient(restTemplate);

        GithubAuthorshipSignal signal = client.assessAuthorship(
                "token", repository(false), "octocat");

        assertThat(signal.status()).isEqualTo(GithubAuthorshipSignal.Status.CONFIRMED);
        assertThat(signal.authoredCommitCount()).isEqualTo(2);
        assertThat(signal.directCommitCount()).isEqualTo(2);
        assertThat(signal.mergeCommitCount()).isZero();
        assertThat(signal.activeDayCount()).isEqualTo(2);
        assertThat(signal.weight()).isEqualByComparingTo("0.90");
        server.verify();
    }

    private GithubRepoResponse repository(boolean fork) {
        return new GithubRepoResponse(
                42L, "app", "octo/app", "demo", "https://github.com/octo/app",
                "2026-01-01T00:00:00Z", "Java", List.of(), "main",
                fork, null, null);
    }
}
