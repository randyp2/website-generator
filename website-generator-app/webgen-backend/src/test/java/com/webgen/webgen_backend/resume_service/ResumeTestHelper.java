package com.webgen.webgen_backend.resume_service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Shared helper for resume tests.
 * Loads normalized .txt fixtures from src/test/resources/resumes/
 * and provides logging utilities for confidence reporting.
 */
public final class ResumeTestHelper {

    // All resume fixture files — add new ones here
    public static final String[] RESUME_FILES = {
            "std-format.txt",
            "std-format-2.txt",
            "std-format-3.txt",
            "std-format-4.txt",
            " content-full.txt",
            "mixed-up-order.txt",
            "typos.txt"
    };

    private ResumeTestHelper() {}

    /**
     * Load a single resume fixture by filename.
     * @param filename e.g. "std-format.txt"
     * @return normalized resume text
     */
    public static String loadResume(String filename) {
        String path = "resumes/" + filename;
        try (InputStream is = ResumeTestHelper.class.getClassLoader().getResourceAsStream(path)) {
            if (is == null) throw new IllegalStateException("Resume fixture not found: " + path);
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load resume fixture: " + path, e);
        }
    }

    /**
     * Load all resume fixtures as a map of filename -> text.
     */
    public static Map<String, String> loadAllResumes() {
        Map<String, String> resumes = new LinkedHashMap<>();
        for (String file : RESUME_FILES) {
            resumes.put(file, loadResume(file));
        }
        return resumes;
    }

    /**
     * Pretty-print a confidence report line.
     * Format: [RESUME] std-format.txt | Confidence: 0.85 | LLM Required: NO
     */
    public static void logConfidence(String filename, double score, double threshold) {
        boolean needsLlm = score < threshold;
        System.out.printf(
                "  [RESUME] %-25s | Confidence: %.2f | LLM Required: %s%n",
                filename, score, needsLlm ? "YES (< " + threshold + ")" : "NO"
        );
    }

    /**
     * Print a section header for grouped test output.
     */
    public static void logHeader(String title) {
        System.out.println();
        System.out.println("=".repeat(75));
        System.out.printf("  %s%n", title);
        System.out.println("=".repeat(75));
    }
}
