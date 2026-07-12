package com.webgen.webgen_backend.verification.service.fingerprint;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Produces deterministic source fingerprints that ignore formatting and file order. */
@Component
public class ArtifactSemanticFingerprintGenerator {

    public static final int ALGORITHM_VERSION = 1;
    private static final int SHINGLE_SIZE = 5;
    private static final int MAX_SKETCH_SIZE = 128;
    private static final int SKETCH_HASH_LENGTH = 16;
    private static final Pattern TOKEN_PATTERN = Pattern.compile(
            "[\\p{L}_$][\\p{L}\\p{N}_$]*|\\p{N}+(?:\\.\\p{N}+)?|===|!==|==|!=|<=|>=|=>|&&|\\|\\||\\S");

    /** Builds a fingerprint from already selected source documents. */
    public Optional<ArtifactSemanticFingerprint> generate(
            int eligibleFileCount,
            List<SourceDocument> documents
    ) {
        if (documents == null || documents.isEmpty()) {
            return Optional.empty();
        }

        List<TokenizedDocument> tokenized = documents.stream()
                .filter(document -> document != null
                        && document.path() != null
                        && document.content() != null
                        && !document.content().isBlank())
                .map(this::tokenize)
                .filter(document -> !document.tokens().isEmpty())
                .sorted(Comparator.comparing(TokenizedDocument::path))
                .toList();
        if (tokenized.isEmpty()) {
            return Optional.empty();
        }

        Set<String> shingleHashes = new TreeSet<>();
        int tokenCount = 0;
        MessageDigest exactDigest = digest();
        for (TokenizedDocument document : tokenized) {
            tokenCount += document.tokens().size();
            updateExactDigest(exactDigest, document);
            addShingles(document.tokens(), shingleHashes);
        }

        List<String> sketch = shingleHashes.stream()
                .limit(MAX_SKETCH_SIZE)
                .toList();
        return Optional.of(new ArtifactSemanticFingerprint(
                ALGORITHM_VERSION,
                HexFormat.of().formatHex(exactDigest.digest()),
                sketch,
                Math.max(eligibleFileCount, tokenized.size()),
                tokenized.size(),
                tokenCount,
                shingleHashes.size(),
                tokenized.stream().map(TokenizedDocument::path).toList()));
    }

    private TokenizedDocument tokenize(SourceDocument document) {
        String normalized = document.content()
                .replace("\r\n", "\n")
                .replace('\r', '\n');
        Matcher matcher = TOKEN_PATTERN.matcher(normalized);
        List<String> tokens = new ArrayList<>();
        while (matcher.find()) {
            tokens.add(matcher.group());
        }
        return new TokenizedDocument(document.path(), List.copyOf(tokens));
    }

    private void updateExactDigest(MessageDigest digest, TokenizedDocument document) {
        digest.update(document.path().getBytes(StandardCharsets.UTF_8));
        digest.update((byte) 0);
        for (String token : document.tokens()) {
            digest.update(token.getBytes(StandardCharsets.UTF_8));
            digest.update((byte) 31);
        }
        digest.update((byte) 0);
    }

    private void addShingles(List<String> tokens, Set<String> hashes) {
        if (tokens.size() < SHINGLE_SIZE) {
            return;
        }
        MessageDigest shingleDigest = digest();
        for (int index = 0; index <= tokens.size() - SHINGLE_SIZE; index++) {
            String shingle = String.join("\u001f", tokens.subList(index, index + SHINGLE_SIZE));
            String hash = HexFormat.of().formatHex(shingleDigest.digest(
                    shingle.getBytes(StandardCharsets.UTF_8))).substring(0, SKETCH_HASH_LENGTH);
            hashes.add(hash);
        }
    }

    private MessageDigest digest() {
        try {
            return MessageDigest.getInstance("SHA-256");
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    /** One repository-relative source file and its decoded text content. */
    public record SourceDocument(String path, String content) {}

    private record TokenizedDocument(String path, List<String> tokens) {}
}
