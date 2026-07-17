package com.webgen.webgen_backend.auth.service;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.crypto.ECDSAVerifier;
import com.nimbusds.jose.crypto.RSASSAVerifier;
import com.nimbusds.jose.jwk.ECKey;
import com.nimbusds.jose.jwk.JWKMatcher;
import com.nimbusds.jose.jwk.JWKSelector;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.SignedJWT;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.util.Date;

@Service
public class JWTService {

    // TEMP diagnostic: remove once the 403/token issue is resolved.
    private static final Logger log = LoggerFactory.getLogger(JWTService.class);

    /**
     * Supabase JWKS endpoint where public RSA keys are published.
     * These rotate and should NOT be hardcoded.
     *
     * Ex: https://YOUR_PROJECT.supabase.co/auth/v1/keys
     */
    private final String jwksUrl;

    /**
     * JWKS provider that fetches and caches the RSA public keys automatically.
     * Nimbus handles caching internally
     */
    private final RemoteJWKSet<SecurityContext> jwkSet;

    public JWTService(
            @Value("${supabase.project.url}") String projectUrl) {

        try {
            // Construct JWKS url
            this.jwksUrl = projectUrl + "/auth/v1/.well-known/jwks.json";
            URI uri = URI.create(jwksUrl);
            URL url = uri.toURL();

            /**
             * Used to store cachsed set of JWKs fetched form the URL
             */
            this.jwkSet = new RemoteJWKSet<>(url);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to initialize JWKS URL", e);
        }
    }

    /* ============== VALIDATION LOGIC ============== */
    /**
     * Validates:
     * - JWT signature using Supabase's RSA public key
     * - JWT expiration time
     */
    public boolean isValid(String token) {
        try {
            SignedJWT jwt = SignedJWT.parse(token);

            // TEMP diagnostic: what algorithm/key is the token signed with?
            log.warn("[JWT-DEBUG] validating token alg={} kid={}",
                    jwt.getHeader().getAlgorithm(), jwt.getHeader().getKeyID());

            // Find the correct RSA key from the JWKS using "kid"
            ECKey publicKey = getKey(jwt);

            // Check verification with EC public key
            boolean verified = jwt.verify(
                    new ECDSAVerifier(publicKey));

            if (!verified) {
                log.warn("[JWT-DEBUG] signature verification FAILED for kid={}",
                        jwt.getHeader().getKeyID());
                return false;
            }

            // Check expiration
            Date expiration = jwt.getJWTClaimsSet().getExpirationTime();
            if (expiration.before(new Date())) {
                log.warn("[JWT-DEBUG] token EXPIRED at {} (server now {})",
                        expiration, new Date());
                return false;
            }

            return true;

        } catch (Exception e) {
            // Catches: no matching kid in JWKS (JOSEException), RSA key cast
            // (ClassCastException), malformed token (ParseException), JWKS
            // fetch failure, etc.
            log.warn("[JWT-DEBUG] token validation error: {}: {}",
                    e.getClass().getSimpleName(), e.getMessage());
            return false;
        }
    }

    /**
     * Extracts the user ID (JWT subject claim) from a raw token string.
     * Does not validate the signature; call isValid first when authentication is required.
     *
     * @param token raw JWT string
     * @return subject claim value (Supabase user UUID as a string)
     * @throws Exception if the token cannot be parsed
     */
    public String extractUserId(String token) throws Exception {
        SignedJWT signedJWT = SignedJWT.parse(token);
        return signedJWT.getJWTClaimsSet().getSubject();
    }

    /**
     * Extracts the authenticated account email from an already validated JWT.
     *
     * @param token raw JWT string
     * @return email claim, or null when the provider omitted it
     * @throws Exception if the token cannot be parsed
     */
    public String extractEmail(String token) throws Exception {
        SignedJWT signedJWT = SignedJWT.parse(token);
        return signedJWT.getJWTClaimsSet().getStringClaim("email");
    }

    /* ============== HELPER FUNCTIONS ============== */

    /*
     * Looks up the EC public key by "kid" header from the cached JWKS set.
     * Nimbus handles remote key fetching and in-memory caching internally,
     * so this call is fast on cache hits and makes a network request on misses.
     */
    private ECKey getKey(SignedJWT jwt) throws Exception {
        String keyId = jwt.getHeader().getKeyID();

        JWKSelector selector = new JWKSelector(
                new JWKMatcher.Builder().keyID(keyId).build());

        var keys = jwkSet.get(selector, null);

        if (keys == null || keys.isEmpty()) {
            throw new JOSEException("No matching 'kid' found in JWKS: " + keyId);
        }

        return (ECKey) keys.getFirst();
    }

}
