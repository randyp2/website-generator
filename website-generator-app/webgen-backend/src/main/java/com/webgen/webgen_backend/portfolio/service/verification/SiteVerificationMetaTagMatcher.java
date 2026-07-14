package com.webgen.webgen_backend.portfolio.service.verification;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/** Finds and validates ownership tokens in returned website HTML. */
@Component
public class SiteVerificationMetaTagMatcher {

    private static final String VERIFICATION_META_NAME =
            "webgen-site-verification";

    /** Returns true when any verification meta element contains the exact token. */
    public boolean containsToken(String html, String expectedToken) {
        if (html == null || html.isBlank()
                || expectedToken == null || expectedToken.isBlank()) {
            return false;
        }
        for (Element element : Jsoup.parse(html).select("meta[name]")) {
            if (VERIFICATION_META_NAME.equalsIgnoreCase(
                    element.attr("name").trim()
            ) && tokensMatch(expectedToken, element.attr("content"))) {
                return true;
            }
        }
        return false;
    }

    private boolean tokensMatch(String expectedToken, String actualToken) {
        return MessageDigest.isEqual(
                expectedToken.getBytes(StandardCharsets.UTF_8),
                actualToken.getBytes(StandardCharsets.UTF_8)
        );
    }
}
