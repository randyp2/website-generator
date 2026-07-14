package com.webgen.webgen_backend.portfolio.service.verification;

import com.webgen.webgen_backend.shared.util.ExternalUrlSafetyValidator;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Locale;
import java.util.Set;

/** Fetches bounded HTML from public HTTPS pages without executing JavaScript. */
@Component
public class SiteVerificationPageClient {

    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(3);
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(5);
    private static final int MAX_HTML_BYTES = 1_048_576;
    private static final int MAX_REDIRECTS = 3;
    private static final Set<Integer> REDIRECT_STATUSES =
            Set.of(301, 302, 303, 307, 308);

    private final HttpClient httpClient;

    /** Creates the production client with bounded timeouts and manual redirects. */
    public SiteVerificationPageClient() {
        this(HttpClient.newBuilder()
                .connectTimeout(CONNECT_TIMEOUT)
                .followRedirects(HttpClient.Redirect.NEVER)
                .build());
    }

    SiteVerificationPageClient(HttpClient httpClient) {
        this.httpClient = httpClient;
    }

    /** Returns the initial HTML response after validating each redirect target. */
    public String fetchHtml(String verificationUrl) {
        URI currentUri = validateHttpsTarget(verificationUrl);
        for (int redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
            HttpResponse<InputStream> response = send(currentUri);
            try (InputStream body = response.body()) {
                if (REDIRECT_STATUSES.contains(response.statusCode())) {
                    if (redirectCount == MAX_REDIRECTS) {
                        throw new SiteVerificationPageFetchException(
                                "Website redirected too many times"
                        );
                    }
                    currentUri = resolveRedirect(currentUri, response);
                    continue;
                }
                validateHtmlResponse(response);
                return readBoundedBody(body);
            } catch (IOException exception) {
                throw new SiteVerificationPageFetchException(
                        "Unable to read the website HTML",
                        exception
                );
            }
        }
        throw new SiteVerificationPageFetchException(
                "Website redirected too many times"
        );
    }

    private HttpResponse<InputStream> send(URI uri) {
        HttpRequest request = HttpRequest.newBuilder(uri)
                .timeout(REQUEST_TIMEOUT)
                .header("Accept", "text/html, application/xhtml+xml;q=0.9")
                .header("User-Agent", "Webgen-Site-Verifier/1.0")
                .GET()
                .build();
        try {
            return httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofInputStream()
            );
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new SiteVerificationPageFetchException(
                    "Website verification request was interrupted",
                    exception
            );
        } catch (IOException exception) {
            throw new SiteVerificationPageFetchException(
                    "Unable to reach the website",
                    exception
            );
        }
    }

    private URI resolveRedirect(
            URI currentUri,
            HttpResponse<InputStream> response
    ) {
        String location = response.headers()
                .firstValue("Location")
                .orElseThrow(() -> new SiteVerificationPageFetchException(
                        "Website returned a redirect without a location"
                ));
        return validateHttpsTarget(currentUri.resolve(location).toString());
    }

    private URI validateHttpsTarget(String rawUrl) {
        try {
            String safeUrl = ExternalUrlSafetyValidator
                    .normalizeAndValidateExternalUrl(rawUrl);
            URI uri = URI.create(safeUrl);
            if (!"https".equalsIgnoreCase(uri.getScheme())) {
                throw new SiteVerificationPageFetchException(
                        "Website verification redirects must use HTTPS"
                );
            }
            return uri;
        } catch (IllegalArgumentException exception) {
            throw new SiteVerificationPageFetchException(
                    "Website verification URL is not a safe public address",
                    exception
            );
        }
    }

    private void validateHtmlResponse(HttpResponse<InputStream> response) {
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new SiteVerificationPageFetchException(
                    "Website returned HTTP " + response.statusCode()
            );
        }
        String contentType = response.headers()
                .firstValue("Content-Type")
                .orElse("")
                .toLowerCase(Locale.ROOT);
        if (!contentType.startsWith("text/html")
                && !contentType.startsWith("application/xhtml+xml")) {
            throw new SiteVerificationPageFetchException(
                    "Website did not return HTML content"
            );
        }
        response.headers().firstValueAsLong("Content-Length").ifPresent(length -> {
            if (length > MAX_HTML_BYTES) {
                throw new SiteVerificationPageFetchException(
                        "Website HTML exceeds the verification size limit"
                );
            }
        });
    }

    private String readBoundedBody(InputStream body) throws IOException {
        byte[] bytes = body.readNBytes(MAX_HTML_BYTES + 1);
        if (bytes.length > MAX_HTML_BYTES) {
            throw new SiteVerificationPageFetchException(
                    "Website HTML exceeds the verification size limit"
            );
        }
        return new String(bytes, StandardCharsets.UTF_8);
    }
}
