package com.webgen.webgen_backend.shared.storage;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.headerDoesNotExist;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class SupabaseStorageClientTest {

    private static final String PROJECT_URL = "https://example.supabase.co";
    private static final String SERVICE_ROLE_KEY = "sb_secret_server-key";

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
                .andExpect(header("apikey", SERVICE_ROLE_KEY))
                .andExpect(headerDoesNotExist(HttpHeaders.AUTHORIZATION))
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

    @Test
    void createsSignedUploadTokenForExactPath() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        SupabaseStorageClient client = new SupabaseStorageClient(
                restTemplate,
                PROJECT_URL,
                SERVICE_ROLE_KEY
        );

        server.expect(once(), requestTo(
                        PROJECT_URL + "/storage/v1/object/upload/sign/private_resumes/resumes/portfolio/resume.pdf"
                ))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("apikey", SERVICE_ROLE_KEY))
                .andExpect(content().json("{}"))
                .andRespond(withSuccess("""
                        {
                          "url": "/object/upload/sign/private_resumes/resumes/portfolio/resume.pdf?token=signed-token"
                        }
                        """, MediaType.APPLICATION_JSON));

        SupabaseStorageClient.SignedUpload upload = client.createSignedUpload(
                "private_resumes",
                "resumes/portfolio/resume.pdf"
        );

        assertThat(upload.bucket()).isEqualTo("private_resumes");
        assertThat(upload.path()).isEqualTo("resumes/portfolio/resume.pdf");
        assertThat(upload.token()).isEqualTo("signed-token");
        server.verify();
    }

    @Test
    void readsObjectMetadataBeforeDownloading() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        SupabaseStorageClient client = new SupabaseStorageClient(
                restTemplate,
                PROJECT_URL,
                SERVICE_ROLE_KEY
        );

        server.expect(once(), requestTo(
                        PROJECT_URL + "/storage/v1/object/info/private_resumes/resumes/portfolio/resume.pdf"
                ))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("""
                        {
                          "size": 2048,
                          "content_type": "application/pdf"
                        }
                        """, MediaType.APPLICATION_JSON));

        Optional<SupabaseStorageClient.ObjectInfo> info = client.getObjectInfo(
                "private_resumes",
                "resumes/portfolio/resume.pdf"
        );

        assertThat(info).contains(
                new SupabaseStorageClient.ObjectInfo(2048, "application/pdf")
        );
        server.verify();
    }

    @Test
    void downloadsPrivateObjectWithAdminHeaders() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        SupabaseStorageClient client = new SupabaseStorageClient(
                restTemplate,
                PROJECT_URL,
                SERVICE_ROLE_KEY
        );

        server.expect(once(), requestTo(
                        PROJECT_URL + "/storage/v1/object/private_resumes/resumes/portfolio/resume.pdf"
                ))
                .andExpect(method(HttpMethod.GET))
                .andExpect(header("apikey", SERVICE_ROLE_KEY))
                .andRespond(withSuccess(new byte[]{1, 2, 3}, MediaType.APPLICATION_PDF));

        assertThat(client.downloadObject(
                "private_resumes",
                "resumes/portfolio/resume.pdf"
        )).containsExactly(1, 2, 3);
        server.verify();
    }
}
