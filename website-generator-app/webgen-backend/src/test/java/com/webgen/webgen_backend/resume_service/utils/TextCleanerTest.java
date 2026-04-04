package com.webgen.webgen_backend.resume_service.utils;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class TextCleanerTest {

    private final TextCleaner cleaner = new TextCleaner();

    // ========================================================================
    // Bullet normalization — every resume passes through this cleaner.
    // PDFs use diverse bullet characters (•, ●, ▪, ►, etc.) that must
    // all be converted to standard dashes for downstream regex parsing.
    // ========================================================================
    @Nested
    class BulletNormalization {

        @Test
        void convertsBulletCharactersToDashes() {
            String input = "Skills\n• Java\n● Python\n▪ React";

            String result = cleaner.clean(input);

            // All bullet variants replaced with "- "
            assertThat(result).contains("- Java");
            assertThat(result).contains("- Python");
            assertThat(result).contains("- React");
            assertThat(result).doesNotContain("•");
            assertThat(result).doesNotContain("●");
            assertThat(result).doesNotContain("▪");
        }

        @Test
        void convertsMoreBulletVariants() {
            String input = "Items\n◦ First\n■ Second\n▸ Third\n► Fourth";

            String result = cleaner.clean(input);

            assertThat(result).contains("- First");
            assertThat(result).contains("- Second");
            assertThat(result).contains("- Third");
            assertThat(result).contains("- Fourth");
        }

        @Test
        void preservesDashBullets() {
            // Already-standard dashes should pass through unchanged
            String input = "Experience\n- Built APIs\n- Led team";

            String result = cleaner.clean(input);

            assertThat(result).contains("- Built APIs");
            assertThat(result).contains("- Led team");
        }
    }

    // ========================================================================
    // Line ending normalization — PDFs from different OS produce different
    // line endings. All must be normalized to \n for consistent parsing.
    // ========================================================================
    @Nested
    class LineEndingNormalization {

        @Test
        void normalizesWindowsLineEndings() {
            String input = "Line 1\r\nLine 2\r\nLine 3";

            String result = cleaner.clean(input);

            assertThat(result).doesNotContain("\r");
            assertThat(result).contains("Line 1\nLine 2\nLine 3");
        }

        @Test
        void normalizesOldMacLineEndings() {
            String input = "Line 1\rLine 2\rLine 3";

            String result = cleaner.clean(input);

            assertThat(result).doesNotContain("\r");
            assertThat(result).contains("Line 1\nLine 2\nLine 3");
        }
    }

    // ========================================================================
    // Whitespace handling — PDFs often have excessive spaces, trailing
    // whitespace, and multiple blank lines that confuse regex patterns.
    // ========================================================================
    @Nested
    class WhitespaceHandling {

        @Test
        void collapsesMultipleSpaces() {
            String input = "Hello    World     Test";

            String result = cleaner.clean(input);

            assertThat(result).isEqualTo("Hello World Test");
        }

        @Test
        void collapsesMultipleBlankLines() {
            String input = "Section 1\n\n\n\n\nSection 2";

            String result = cleaner.clean(input);

            // Max two consecutive newlines
            assertThat(result).doesNotContain("\n\n\n");
            assertThat(result).contains("Section 1\n\nSection 2");
        }

        @Test
        void removesTrailingSpacesOnLines() {
            String input = "Line 1   \nLine 2   \n";

            String result = cleaner.clean(input);

            assertThat(result).doesNotContain(" \n");
        }

        @Test
        void trimsLeadingAndTrailingWhitespace() {
            String input = "   \n\n  Resume content here  \n\n   ";

            String result = cleaner.clean(input);

            assertThat(result).isEqualTo("Resume content here");
        }
    }

    // ========================================================================
    // Edge cases — null, blank, and minimal input.
    // ========================================================================
    @Nested
    class EdgeCases {

        @Test
        void returnsEmptyForNull() {
            assertThat(cleaner.clean(null)).isEmpty();
        }

        @Test
        void returnsEmptyForBlank() {
            assertThat(cleaner.clean("   ")).isEmpty();
        }

        @Test
        void returnsEmptyForOnlyNewlines() {
            assertThat(cleaner.clean("\n\n\n")).isEmpty();
        }

        @Test
        void handlesTabCharacters() {
            String input = "Skills\n\tJava\t\tPython";

            String result = cleaner.clean(input);

            // Tabs collapsed to single space
            assertThat(result).contains("Java Python");
        }
    }
}
