package com.webgen.webgen_backend.verification.service.provider.github;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class GithubTokenCipher {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Value("${github.oauth.token-encryption-secret:}")
    private String tokenEncryptionSecret;

    public String decryptRequiredToken(String encryptedToken, String label) {
        if (isBlank(encryptedToken)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Missing provider " + label + ". Reconnect is required.");
        }

        try {
            String[] parts = encryptedToken.split(":", 2);
            if (parts.length != 2) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Stored provider token format is invalid. Reconnect is required.");
            }

            byte[] iv = Base64.getDecoder().decode(parts[0]);
            byte[] cipherText = Base64.getDecoder().decode(parts[1]);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec gcmSpec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.DECRYPT_MODE, deriveEncryptionKey(), gcmSpec);

            byte[] decrypted = cipher.doFinal(cipherText);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Failed to decrypt provider token. Reconnect is required.",
                    exception);
        }
    }

    public String encryptToken(String token) {
        try {
            byte[] iv = new byte[12];
            SECURE_RANDOM.nextBytes(iv);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec gcmSpec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.ENCRYPT_MODE, deriveEncryptionKey(), gcmSpec);

            byte[] encrypted = cipher.doFinal(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(iv)
                    + ":"
                    + Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to encrypt provider token",
                    exception);
        }
    }

    private SecretKeySpec deriveEncryptionKey() throws Exception {
        if (isBlank(tokenEncryptionSecret)) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Provider token encryption secret is not configured");
        }

        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] keyBytes = digest.digest(tokenEncryptionSecret.getBytes(StandardCharsets.UTF_8));
        return new SecretKeySpec(keyBytes, "AES");
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
