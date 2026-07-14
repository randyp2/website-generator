package com.webgen.webgen_backend.portfolio.service.verification;

import org.junit.jupiter.api.Test;

import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLParameters;
import javax.net.ssl.SSLSession;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.Authenticator;
import java.net.CookieHandler;
import java.net.ProxySelector;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.ArrayDeque;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Queue;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SiteVerificationPageClientTest {

    private static final String URL = "https://8.8.8.8/portfolio";

    @Test
    void fetchesBoundedHtmlWithExpectedHeaders() {
        StubHttpClient httpClient = new StubHttpClient();
        httpClient.enqueue(response(
                200,
                Map.of("Content-Type", List.of("text/html; charset=utf-8")),
                "<html><head></head></html>"
        ));
        SiteVerificationPageClient client =
                new SiteVerificationPageClient(httpClient);

        String html = client.fetchHtml(URL);

        assertThat(html).isEqualTo("<html><head></head></html>");
        assertThat(httpClient.lastRequest.headers().firstValue("User-Agent"))
                .contains("Webgen-Site-Verifier/1.0");
    }

    @Test
    void rejectsRedirectToPrivateAddress() {
        StubHttpClient httpClient = new StubHttpClient();
        httpClient.enqueue(response(
                302,
                Map.of("Location", List.of("https://127.0.0.1/internal")),
                ""
        ));

        assertThatThrownBy(() -> new SiteVerificationPageClient(httpClient)
                .fetchHtml(URL))
                .isInstanceOf(SiteVerificationPageFetchException.class)
                .hasMessageContaining("safe public address");
    }

    @Test
    void rejectsNonHtmlResponse() {
        StubHttpClient httpClient = new StubHttpClient();
        httpClient.enqueue(response(
                200,
                Map.of("Content-Type", List.of("application/json")),
                "{}"
        ));

        assertThatThrownBy(() -> new SiteVerificationPageClient(httpClient)
                .fetchHtml(URL))
                .isInstanceOf(SiteVerificationPageFetchException.class)
                .hasMessageContaining("did not return HTML");
    }

    private StubResponse response(
            int status,
            Map<String, List<String>> headers,
            String body
    ) {
        return new StubResponse(
                status,
                HttpHeaders.of(headers, (name, value) -> true),
                new ByteArrayInputStream(body.getBytes(StandardCharsets.UTF_8)),
                URI.create(URL)
        );
    }

    private record StubResponse(
            int statusCode,
            HttpHeaders headers,
            InputStream body,
            URI uri
    ) implements HttpResponse<InputStream> {

        @Override
        public HttpRequest request() {
            return null;
        }

        @Override
        public Optional<HttpResponse<InputStream>> previousResponse() {
            return Optional.empty();
        }

        @Override
        public Optional<SSLSession> sslSession() {
            return Optional.empty();
        }

        @Override
        public HttpClient.Version version() {
            return HttpClient.Version.HTTP_1_1;
        }
    }

    private static final class StubHttpClient extends HttpClient {
        private final Queue<HttpResponse<InputStream>> responses =
                new ArrayDeque<>();
        private HttpRequest lastRequest;

        private void enqueue(HttpResponse<InputStream> response) {
            responses.add(response);
        }

        @Override
        @SuppressWarnings("unchecked")
        public <T> HttpResponse<T> send(
                HttpRequest request,
                HttpResponse.BodyHandler<T> responseBodyHandler
        ) throws IOException {
            lastRequest = request;
            HttpResponse<InputStream> response = responses.poll();
            if (response == null) throw new IOException("No stub response");
            return (HttpResponse<T>) response;
        }

        @Override
        public Optional<CookieHandler> cookieHandler() {
            return Optional.empty();
        }

        @Override
        public Optional<Duration> connectTimeout() {
            return Optional.of(Duration.ofSeconds(3));
        }

        @Override
        public Redirect followRedirects() {
            return Redirect.NEVER;
        }

        @Override
        public Optional<ProxySelector> proxy() {
            return Optional.empty();
        }

        @Override
        public SSLContext sslContext() {
            try {
                return SSLContext.getDefault();
            } catch (NoSuchAlgorithmException exception) {
                throw new IllegalStateException(exception);
            }
        }

        @Override
        public SSLParameters sslParameters() {
            return new SSLParameters();
        }

        @Override
        public Optional<Authenticator> authenticator() {
            return Optional.empty();
        }

        @Override
        public Version version() {
            return Version.HTTP_1_1;
        }

        @Override
        public Optional<Executor> executor() {
            return Optional.empty();
        }

        @Override
        public <T> CompletableFuture<HttpResponse<T>> sendAsync(
                HttpRequest request,
                HttpResponse.BodyHandler<T> responseBodyHandler
        ) {
            throw new UnsupportedOperationException();
        }

        @Override
        public <T> CompletableFuture<HttpResponse<T>> sendAsync(
                HttpRequest request,
                HttpResponse.BodyHandler<T> responseBodyHandler,
                HttpResponse.PushPromiseHandler<T> pushPromiseHandler
        ) {
            throw new UnsupportedOperationException();
        }
    }
}
