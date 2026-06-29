package com.webgen.webgen_backend.verification.service.sync;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

public final class VerificationMatchTextHelper {

    private VerificationMatchTextHelper() {
    }

    public static void addMatchingTerm(Set<String> out, String raw) {
        String normalized = normalizeForMatch(raw);
        if (!isBlank(normalized) && normalized.length() >= 2) {
            out.add(normalized);
        }
    }

    public static String normalizeForMatch(String value) {
        if (isBlank(value)) {
            return "";
        }

        return value
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9+#.]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
    }

    public static boolean containsTermInCollection(List<String> values, String term) {
        for (String value : values) {
            if (containsTerm(value, term)) {
                return true;
            }
        }
        return false;
    }

    public static boolean containsTerm(String haystack, String term) {
        return !isBlank(haystack) && !isBlank(term) && haystack.contains(term);
    }

    public static List<String> readNormalizedArray(JsonNode metadata, String field) {
        if (metadata == null || !metadata.has(field) || !metadata.get(field).isArray()) {
            return List.of();
        }

        List<String> values = new ArrayList<>();
        for (JsonNode node : metadata.get(field)) {
            if (!node.isTextual()) {
                continue;
            }
            String normalized = normalizeForMatch(node.asText());
            if (!isBlank(normalized)) {
                values.add(normalized);
            }
        }
        return values;
    }

    public static String readText(JsonNode node, String field) {
        if (node == null || !node.has(field) || node.get(field).isNull()) {
            return null;
        }
        return node.get(field).asText(null);
    }

    public static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
