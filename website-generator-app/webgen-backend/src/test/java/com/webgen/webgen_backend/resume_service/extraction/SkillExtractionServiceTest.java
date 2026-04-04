package com.webgen.webgen_backend.resume_service.extraction;

import com.webgen.webgen_backend.resume_service.ResumeTestHelper;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;

class SkillExtractionServiceTest {

    private final SkillExtractionService service = new SkillExtractionService();

    // ========================================================================
    // Real resume extraction — logs extracted skills from every test resume.
    // Skills feed directly into the portfolio generation prompt, so missing
    // or garbled skills degrade the generated portfolio quality.
    // ========================================================================
    @Nested
    class RealResumeExtraction {

        @Test
        void extractsSkillsFromAllResumes() {
            ResumeTestHelper.logHeader("SKILLS EXTRACTION REPORT");

            Map<String, String> resumes = ResumeTestHelper.loadAllResumes();

            for (var entry : resumes.entrySet()) {
                List<String> skills = service.extractSkills(entry.getValue());

                System.out.printf("  [%-25s] Found %d skill(s): %s%n",
                        entry.getKey(),
                        skills.size(),
                        skills.size() > 5
                                ? skills.subList(0, 5) + " ... +" + (skills.size() - 5) + " more"
                                : skills
                );
            }
            System.out.println("=".repeat(75));
        }
    }

    // ========================================================================
    // Delimiter handling — skills are tokenized by commas, newlines,
    // semicolons, and dashes. Each delimiter type needs testing.
    // ========================================================================
    @Nested
    class DelimiterHandling {

        @Test
        void tokenizesCommaDelimitedSkills() {
            String text = "Skills\nJava, Python, React, Docker\nExperience\nSome job";

            List<String> skills = service.extractSkills(text);

            assertThat(skills).contains("Java", "Python", "React", "Docker");
        }

        @Test
        void tokenizesNewlineDelimitedSkills() {
            String text = "Technical Skills\nJava\nPython\nReact\nExperience\nSome job";

            List<String> skills = service.extractSkills(text);

            assertThat(skills).contains("Java", "Python", "React");
        }

        @Test
        void tokenizesSemicolonDelimitedSkills() {
            String text = "Skills\nJava; Python; React\nExperience\nSome job";

            List<String> skills = service.extractSkills(text);

            assertThat(skills).contains("Java", "Python", "React");
        }

        @Test
        void filtersEmptyTokens() {
            // Empty tokens from consecutive delimiters get filtered out
            String text = "Skills\n,,Java,, ,Python,,\nExperience\nSome job";

            List<String> skills = service.extractSkills(text);

            assertThat(skills).contains("Java", "Python");
            assertThat(skills).noneMatch(String::isEmpty);
        }
    }

    // ========================================================================
    // Section detection — skills section must be found between the right
    // headers. Different resumes use different header names.
    // ========================================================================
    @Nested
    class SectionDetection {

        @Test
        void findsSkillsUnderTechnicalSkillsHeader() {
            String text = "Technical Skills\nJava, Python\nExperience\nSome job";

            List<String> skills = service.extractSkills(text);

            assertThat(skills).isNotEmpty();
        }

        @Test
        void findsSkillsUnderSkillsAndAbilitiesHeader() {
            String text = "Skills & Abilities\nJava, Python\nExperience\nSome job";

            List<String> skills = service.extractSkills(text);

            assertThat(skills).isNotEmpty();
        }

        @Test
        void returnsEmptyWhenNoSkillsSection() {
            String text = "John Doe\nExperience\nSome job\nEducation\nUNLV";

            List<String> skills = service.extractSkills(text);

            assertThat(skills).isEmpty();
        }

        @Test
        void handlesMultiLineSkillCategories() {
            // Common format: "Languages: X, Y, Z\nFrameworks: A, B, C"
            String text = "Technical Skills\nLanguages: Python, Java, TypeScript\nFrameworks: Spring Boot, React, Next.js\nExperience\nSome job";

            List<String> skills = service.extractSkills(text);

            assertThat(skills).hasSizeGreaterThanOrEqualTo(4);
        }
    }
}
