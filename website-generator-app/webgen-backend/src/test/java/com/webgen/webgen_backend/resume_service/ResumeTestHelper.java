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

    // ANSI color codes
    private static final String RESET  = "\u001B[0m";
    private static final String GREEN  = "\u001B[32m";
    private static final String YELLOW = "\u001B[33m";
    private static final String RED    = "\u001B[31m";
    private static final String CYAN   = "\u001B[36m";
    private static final String BOLD   = "\u001B[1m";
    private static final String DIM    = "\u001B[2m";

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
     * Pretty-print a confidence report line with color.
     * Green = high confidence, Yellow = medium, Red = below threshold
     */
    public static void logConfidence(String filename, double score, double threshold) {
        boolean needsLlm = score < threshold;

        // Color the score based on confidence level
        String scoreColor;
        if (score >= 0.70) scoreColor = GREEN;
        else if (score >= threshold) scoreColor = YELLOW;
        else scoreColor = RED;

        // Color the LLM status
        String llmStatus = needsLlm
                ? RED + BOLD + "YES" + RESET + RED + " (< " + threshold + ")" + RESET
                : GREEN + "NO" + RESET;

        System.out.printf(
                "  %s[RESUME]%s %-25s | Confidence: %s%s%.2f%s | LLM Required: %s%n",
                CYAN, RESET,
                filename,
                scoreColor, BOLD, score, RESET,
                llmStatus
        );
    }

    /**
     * Print a section header for grouped test output.
     */
    public static void logHeader(String title) {
        System.out.println();
        System.out.printf("  %s%s%s%s%n", BOLD, CYAN, "=".repeat(73), RESET);
        System.out.printf("  %s%s  %s%s%n", BOLD, CYAN, title, RESET);
        System.out.printf("  %s%s%s%s%n", BOLD, CYAN, "=".repeat(73), RESET);
    }

    /**
     * Log missing fields with red coloring.
     */
    public static void logMissing(String missing) {
        if (missing.isEmpty()) {
            System.out.printf("    %s%sMissing: none%s%n", DIM, GREEN, RESET);
        } else {
            System.out.printf("    %sMissing: %s%s%s%n", DIM, YELLOW, missing, RESET);
        }
    }

    /**
     * Log a summary totals line.
     */
    public static void logTotals(int total, int llmRequired) {
        int regexSufficient = total - llmRequired;
        System.out.printf("%n  Total: %s%d%s resumes | LLM required: %s%s%d%s | Regex sufficient: %s%s%d%s%n",
                BOLD, total, RESET,
                llmRequired > 0 ? RED + BOLD : GREEN + BOLD, "", llmRequired, RESET,
                GREEN + BOLD, "", regexSufficient, RESET
        );
    }
}
