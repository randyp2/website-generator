package com.webgen.webgen_backend.shared.storage;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class SupabaseStorageClientTest {

    private static final String PROJECT_URL = "https://example.supabase.co";
    private static final String SERVICE_ROLE_KEY = "service-role-key";

    @Test
    void recursivelyListsThenDeletesExactObjectPaths() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        SupabaseStorageClient client = new SupabaseStorageClient(
                restTemplate,
                PROJECT_URL,
                SERVICE_ROLE_KEY
        );

        server.expect(once(), requestTo(PROJECT_URL + "/storage/v1/object/list/private_resumes"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer " + SERVICE_ROLE_KEY))
                .andExpect(header("apikey", SERVICE_ROLE_KEY))
                .andExpect(content().json("""
                        {
                          "prefix": "resumes/profile-id",
                          "limit": 1000,
                          "offset": 0,
                          "sortBy": {"column": "name", "order": "asc"}
                        }
                        """))
                .andRespond(withSuccess("""
                        [
                          {"name": "resume.pdf", "id": "object-1"},
                          {"name": "supporting", "id": null}
                        ]
                        """, MediaType.APPLICATION_JSON));
        server.expect(once(), requestTo(PROJECT_URL + "/storage/v1/object/list/private_resumes"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().json("""
                        {
                          "prefix": "resumes/profile-id/supporting",
                          "limit": 1000,
                          "offset": 0,
                          "sortBy": {"column": "name", "order": "asc"}
                        }
                        """))
                .andRespond(withSuccess("""
                        [{"name": "details.pdf", "id": "object-2"}]
                        """, MediaType.APPLICATION_JSON));
        server.expect(once(), requestTo(PROJECT_URL + "/storage/v1/object/private_resumes"))
                .andExpect(method(HttpMethod.DELETE))
                .andExpect(content().json("""
                        {
                          "prefixes": [
                            "resumes/profile-id/resume.pdf",
                            "resumes/profile-id/supporting/details.pdf"
                          ]
                        }
                        """))
                .andRespond(withSuccess());

        client.deletePrefix("private_resumes", "resumes/profile-id");

        server.verify();
    }

    @Test
    void refusesToOperateOnAnEmptyPrefix() {
        SupabaseStorageClient client = new SupabaseStorageClient(
                new RestTemplate(),
                PROJECT_URL,
                SERVICE_ROLE_KEY
        );

        assertThatThrownBy(() -> client.deletePrefix("private_resumes", " "))
                .isInstanceOf(ResponseStatusException.class);
    }
}
