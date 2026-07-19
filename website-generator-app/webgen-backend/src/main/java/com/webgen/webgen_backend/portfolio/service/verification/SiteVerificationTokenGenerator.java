package com.webgen.webgen_backend.portfolio.service.verification;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * Generates unpredictable public challenge values for website ownership proof.
 */
@Component
public class SiteVerificationTokenGenerator {

    private static final int TOKEN_BYTES = 32;
    private static final String TOKEN_PREFIX = "wg_v1_";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    /**
     * Generates a versioned URL-safe challenge token.
     */
    public String generate() {
        byte[] randomBytes = new byte[TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(randomBytes);
        return TOKEN_PREFIX + Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
