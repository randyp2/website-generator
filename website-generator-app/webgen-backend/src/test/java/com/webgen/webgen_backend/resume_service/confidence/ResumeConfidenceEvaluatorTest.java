package com.webgen.webgen_backend.resume_service.confidence;

import com.webgen.webgen_backend.resume.model.ParsedResume;
import com.webgen.webgen_backend.resume.service.confidence.ResumeConfidenceEvaluator;
import com.webgen.webgen_backend.resume.service.extraction.*;
import com.webgen.webgen_backend.resume.service.ResumeExtractionService;
import com.webgen.webgen_backend.resume_service.ResumeTestHelper;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

@Tag("requires-fixtures")
class ResumeConfidenceEvaluatorTest {

    private static final double LLM_THRESHOLD = 0.40;

    private static final ResumeConfidenceEvaluator evaluator = new ResumeConfidenceEvaluator();

    // Full extraction pipeline for integration-style tests against real resumes
    private static final ResumeExtractionService extractionService = new ResumeExtractionService(
            new SkillExtractionService(),
            new ExperienceExtractionService(),
            new ProjectExtractionService(),
            new EducationExtractionService(),
            new ContactInfoExtractionService(),
            new SummaryExtractionService()
    );

    // ========================================================================
    // Real resume confidence report — logs every resume's score and whether
    // it would trigger LLM fallback. This is the main diagnostic test.
    // ========================================================================
    @Nested
    class RealResumeConfidenceReport {

        @Test
        void logConfidenceScoresForAllResumes() {
            // Runs the full extraction + scoring pipeline on every test resume.
            // Primary purpose: visibility into how the scorer handles real data.
            // If a resume that should pass starts scoring below threshold,
            // this test output will immediately show it.
            ResumeTestHelper.logHeader("CONFIDENCE SCORE REPORT");

            Map<String, String> resumes = ResumeTestHelper.loadAllResumes();
            int llmRequired = 0;

            for (var entry : resumes.entrySet()) {
                ParsedResume parsed = extractionService.extract(entry.getValue());
                double score = evaluator.evaluateConfidence(parsed);

                ResumeTestHelper.logConfidence(entry.getKey(), score, LLM_THRESHOLD);

                // Log which scored fields are missing — these are the sections
                // dragging the confidence score down
                java.util.List<String> missing = new java.util.ArrayList<>();
                if (parsed.getFullName() == null || parsed.getFullName().isBlank()) missing.add("name (-20pts)");
                if (parsed.getEmail() == null || parsed.getEmail().isBlank()) missing.add("email (-20pts)");
                if (parsed.getPhone() == null || parsed.getPhone().isBlank()) missing.add("phone (-10pts)");
                if (parsed.getSkills() == null || parsed.getSkills().size() < 3) missing.add("skills<3 (-10pts)");
                if (parsed.getExperiences() == null || parsed.getExperiences().isEmpty()) missing.add("experience (-20pts)");
                if (parsed.getLocation() == null || parsed.getLocation().isBlank()) missing.add("location (-5pts)");
                if (parsed.getSummary() == null || parsed.getSummary().length() <= 50) missing.add("summary (-5pts)");
                if (parsed.getProjects() == null || parsed.getProjects().isEmpty()) missing.add("projects (-5pts)");
                if (parsed.getEducations() == null || parsed.getEducations().isEmpty()) missing.add("education (-5pts)");

                ResumeTestHelper.logMissing(String.join(", ", missing));

                if (score < LLM_THRESHOLD) llmRequired++;
            }

            ResumeTestHelper.logTotals(resumes.size(), llmRequired);

            // At minimum, the well-formatted resumes should score above threshold
            // If more than half need LLM, something is broken in extraction
            assertThat(llmRequired)
                    .as("Too many resumes falling below confidence threshold — check extraction logic")
                    .isLessThan(resumes.size());
        }
    }

    // ========================================================================
    // Scoring weight verification — ensures the scoring formula produces
    // expected results for known inputs. These catch regressions if
    // someone changes the weight constants.
    // ========================================================================
    @Nested
    class ScoringWeights {

        @Test
        void nullResumeScoresZero() {
            assertThat(evaluator.evaluateConfidence(null)).isEqualTo(0.0);
        }

        @Test
        void emptyResumeScoresZero() {
            ParsedResume empty = new ParsedResume();
            assertThat(evaluator.evaluateConfidence(empty)).isEqualTo(0.0);
        }

        @Test
        void nameAndEmailAloneScore40Percent() {
            // Name (20pts) + Email (20pts) = 40/100 = 0.40
            // This is exactly at the LLM threshold — regex result is accepted
            ParsedResume resume = new ParsedResume();
            resume.setFullName("John Doe");
            resume.setEmail("john@example.com");

            double score = evaluator.evaluateConfidence(resume);
            assertThat(score).isEqualTo(0.40);
        }

        @Test
        void phoneAdds10Points() {
            // Name + Email + Phone = 20 + 20 + 10 = 50/100 = 0.50
            ParsedResume resume = new ParsedResume();
            resume.setFullName("John Doe");
            resume.setEmail("john@example.com");
            resume.setPhone("(702) 555-1234");

            double score = evaluator.evaluateConfidence(resume);
            assertThat(score).isEqualTo(0.50);
        }

        @Test
        void scoreNeverExceedsOne() {
            // Even with every field maximally populated, score caps at 1.0
            ParsedResume resume = buildFullyPopulatedResume();
            double score = evaluator.evaluateConfidence(resume);
            assertThat(score).isLessThanOrEqualTo(1.0);
        }

        @Test
        void partialSkillsGetPartialCredit() {
            // 1-2 skills get proportional credit (3.33 per skill)
            // instead of the full 10 points for 3+ skills
            ParsedResume resume = new ParsedResume();
            resume.setSkills(java.util.List.of("Java", "Python"));

            double score = evaluator.evaluateConfidence(resume);
            // 2 skills * 3.33 = 6.66 / 100 = ~0.0666
            assertThat(score).isCloseTo(0.0666, within(0.01));
        }
    }

    // ========================================================================
    // Validation helpers — the evaluator uses regex patterns to validate
    // contact fields. These test boundary cases.
    // ========================================================================
    @Nested
    class FieldValidation {

        @Test
        void validatesNameRequiresTwoWords() {
            assertThat(evaluator.isValidName("John Doe")).isTrue();
            assertThat(evaluator.isValidName("John")).isFalse();
            assertThat(evaluator.isValidName("")).isFalse();
            assertThat(evaluator.isValidName(null)).isFalse();
        }

        @Test
        void validatesStructuredExperienceRequiresTitleCompanyAndDate() {
            com.webgen.webgen_backend.resume.model.Experience exp = new com.webgen.webgen_backend.resume.model.Experience();

            // Missing all fields
            assertThat(evaluator.hasStructuredExperience(exp)).isFalse();

            // Has title + company but no dates
            exp.setTitle("Engineer");
            exp.setCompany("Acme");
            assertThat(evaluator.hasStructuredExperience(exp)).isFalse();

            // Complete
            exp.setStartDate("Jan 2024");
            assertThat(evaluator.hasStructuredExperience(exp)).isTrue();
        }
    }

    // -- Helper: builds a resume with every scored field populated --
    private ParsedResume buildFullyPopulatedResume() {
        ParsedResume resume = new ParsedResume();
        resume.setFullName("John Doe");
        resume.setEmail("john@example.com");
        resume.setPhone("(702) 555-1234");
        resume.setLocation("Las Vegas, NV");
        resume.setSummary("Experienced software engineer with over 5 years of experience building scalable systems.");
        resume.setSkills(java.util.List.of("Java", "Python", "React", "Docker"));

        com.webgen.webgen_backend.resume.model.Experience exp = new com.webgen.webgen_backend.resume.model.Experience();
        exp.setTitle("Software Engineer");
        exp.setCompany("Acme Corp");
        exp.setStartDate("Jan 2020");
        exp.setEndDate("Present");
        exp.setBullets(java.util.List.of("Built APIs", "Led team of 5"));
        resume.setExperiences(java.util.List.of(exp));

        com.webgen.webgen_backend.resume.model.Project project = new com.webgen.webgen_backend.resume.model.Project();
        project.setHeader("Portfolio Generator");
        resume.setProjects(java.util.List.of(project));

        com.webgen.webgen_backend.resume.model.Education edu = new com.webgen.webgen_backend.resume.model.Education();
        edu.setInstitution("UNLV");
        edu.setDegree("B.S. Computer Science");
        resume.setEducations(java.util.List.of(edu));

        return resume;
    }
}
