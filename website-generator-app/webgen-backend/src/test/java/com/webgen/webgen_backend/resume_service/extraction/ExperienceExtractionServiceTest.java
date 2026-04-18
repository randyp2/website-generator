package com.webgen.webgen_backend.resume_service.extraction;

import com.webgen.webgen_backend.resume.model.Experience;
import com.webgen.webgen_backend.resume.service.extraction.ExperienceExtractionService;
import com.webgen.webgen_backend.resume_service.ResumeTestHelper;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@Tag("requires-fixtures")
class ExperienceExtractionServiceTest {

    private final ExperienceExtractionService service = new ExperienceExtractionService();

    // ========================================================================
    // Real resume extraction — runs the full experience extractor on every
    // test resume. This is the most fragile extractor (~770 lines of regex)
    // and the most important to monitor for regressions.
    // ========================================================================
    @Nested
    class RealResumeExtraction {

        @Test
        void extractsExperiencesFromAllResumes() {
            ResumeTestHelper.logHeader("EXPERIENCE EXTRACTION REPORT");

            Map<String, String> resumes = ResumeTestHelper.loadAllResumes();

            for (var entry : resumes.entrySet()) {
                List<Experience> experiences = service.extractExperience(entry.getValue());

                System.out.printf("  [%-25s] Found %d experience(s):%n", entry.getKey(), experiences.size());
                for (Experience exp : experiences) {
                    System.out.printf("    - %-30s @ %-25s | %s - %s | %d bullet(s)%n",
                            exp.getTitle() != null ? exp.getTitle() : "NO TITLE",
                            exp.getCompany() != null ? exp.getCompany() : "NO COMPANY",
                            exp.getStartDate() != null ? exp.getStartDate() : "?",
                            exp.getEndDate() != null ? exp.getEndDate() : "?",
                            exp.getBullets() != null ? exp.getBullets().size() : 0
                    );
                }
            }
            System.out.println("=".repeat(75));
        }
    }

    // ========================================================================
    // Date format parsing — the extractor supports 6+ date formats.
    // Each format is a separate regex path that can break independently.
    // ========================================================================
    @Nested
    class DateFormatParsing {

        @Test
        void parsesFullMonthToPresent() {
            // Format: "Company January 2024 – Present"
            String text = "Work Experience\nAcme Corp January 2024 – Present\nSoftware Engineer\n- Built APIs";

            List<Experience> results = service.extractExperience(text);

            assertThat(results).isNotEmpty();
            assertThat(results.getFirst().getStartDate()).contains("January");
            assertThat(results.getFirst().getEndDate()).isEqualTo("Present");
        }

        @Test
        void parsesAbbreviatedMonthToPresent() {
            // Format: "Company Dec 2025 – Present" — matches the exact format
            // used by std-format.txt (STARS Dec 2025 – Present)
            String text = "Work Experience\nSTARS Dec 2025 – Present\nSoftware Engineer Las Vegas, Nevada\n- Built APIs";

            List<Experience> results = service.extractExperience(text);

            assertThat(results).isNotEmpty();
            assertThat(results.getFirst().getEndDate()).isEqualTo("Present");
        }

        @Test
        void parsesNumericDateFormat() {
            // Format: "Title, Company 05/2023 – 07/2024"
            String text = "Experience\nFull Stack Developer, LOUD 05/2023 – 07/2024\n- Built full stack app";

            List<Experience> results = service.extractExperience(text);

            assertThat(results).isNotEmpty();
        }
    }

    // ========================================================================
    // Company vs title disambiguation — the extractor must determine
    // whether the first line is a company name or a job title based on
    // keyword heuristics. Getting this wrong swaps title and company.
    // ========================================================================
    @Nested
    class CompanyTitleDisambiguation {

        @Test
        void recognizesCompanyKeywords() {
            // "LLC", "Inc", "University" etc. signal a company name
            String text = "Experience\nMr. Beast YouTube, LLC July 2024 - July 2024\nProduction Assistant Las Vegas, NV\n- Helped with production";

            List<Experience> results = service.extractExperience(text);

            assertThat(results).isNotEmpty();
            Experience exp = results.getFirst();
            // Company should contain the LLC entity, not be treated as title
            assertThat(exp.getCompany()).isNotNull();
        }

        @Test
        void recognizesJobTitleKeywords() {
            // "Engineer", "Developer", "Manager" etc. signal a job title
            String text = "Experience\nSoftware Engineer January 2024 – Present\nAcme Corp Las Vegas, NV\n- Built APIs";

            List<Experience> results = service.extractExperience(text);

            assertThat(results).isNotEmpty();
            Experience exp = results.getFirst();
            assertThat(exp.getTitle()).isNotNull();
            assertThat(exp.getTitle().toLowerCase()).contains("engineer");
        }
    }

    // ========================================================================
    // Bullet extraction — must handle both explicit dashes and implicit
    // bullets (lines that start with action verbs when dashes are stripped).
    // ========================================================================
    @Nested
    class BulletExtraction {

        @Test
        void extractsDashBullets() {
            String text = "Experience\nAcme Corp Jan 2024 – Present\nEngineer\n- Built scalable APIs serving 1M requests\n- Led team of 5 engineers\n- Reduced latency by 40%";

            List<Experience> results = service.extractExperience(text);

            assertThat(results).isNotEmpty();
            assertThat(results.getFirst().getBullets())
                    .isNotNull()
                    .hasSizeGreaterThanOrEqualTo(2);
        }

        @Test
        void returnsEmptyForNoExperienceSection() {
            // Resume with no experience section at all
            String text = "John Doe\nEducation\nUNLV\nSkills\nJava, Python";

            List<Experience> results = service.extractExperience(text);

            assertThat(results).isEmpty();
        }
    }

    // ========================================================================
    // Multi-format resume support — the extractor handles resumes where
    // company and date are on the same line, or on different lines.
    // ========================================================================
    @Nested
    class MultiFormatSupport {

        @Test
        void handlesCompanyAndDateOnSameLine() {
            // Format 1: "CRJ Services Sep 2025 – Present"
            String text = "Work Experience\nCRJ Services Sep 2025 – Present\nSoftware Engineer Las Vegas, NV\n- Built APIs\n- Led team";

            List<Experience> results = service.extractExperience(text);

            assertThat(results).isNotEmpty();
            assertThat(results.getFirst().getCompany()).contains("CRJ");
        }

        @Test
        void handlesRoleAndDateOnSameLine() {
            // Format 2: Company on line 0, "Title Date" on line 1
            String text = "Experience\nAcme Corp\nSoftware Engineer Jan 2024 – Present\n- Built APIs";

            List<Experience> results = service.extractExperience(text);

            assertThat(results).isNotEmpty();
        }

        @Test
        void extractsMultipleExperiences() {
            // Two experiences back to back
            String text = """
                Experience
                Acme Corp Jan 2024 – Present
                Engineer
                - Built APIs
                - Led team
                Old Co Jun 2022 – Dec 2023
                Intern
                - Learned things
                - Wrote code
                """;

            List<Experience> results = service.extractExperience(text);

            assertThat(results).hasSizeGreaterThanOrEqualTo(2);
        }
    }
}
