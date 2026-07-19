package com.webgen.webgen_backend.resume_service.quality;

import com.webgen.webgen_backend.resume.model.Experience;
import com.webgen.webgen_backend.resume.model.ParsedResume;
import com.webgen.webgen_backend.resume.service.quality.ResumeParseQualityResult;
import com.webgen.webgen_backend.resume.service.quality.ResumeParseQualityValidator;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ResumeParseQualityValidatorTest {

    private final ResumeParseQualityValidator validator = new ResumeParseQualityValidator();

    @Test
    void acceptsStructurallySaneResume() {
        ParsedResume resume = baseResume();

        ResumeParseQualityResult result = validator.evaluate(resume);

        assertThat(result.acceptable()).isTrue();
        assertThat(result.issues()).isEmpty();
    }

    @Test
    void rejectsNameContainingContactLabel() {
        ParsedResume resume = baseResume();
        resume.setFullName("Robert Porchas Email");

        ResumeParseQualityResult result = validator.evaluate(resume);

        assertThat(result.acceptable()).isFalse();
        assertThat(issueCodes(result)).contains("contact.name_contains_label");
    }

    @Test
    void rejectsReversedStateLocation() {
        ParsedResume resume = baseResume();
        resume.setLocation("Nevada, Las");

        ResumeParseQualityResult result = validator.evaluate(resume);

        assertThat(result.acceptable()).isFalse();
        assertThat(issueCodes(result)).contains("contact.location_reversed");
    }

    @Test
    void rejectsExperienceCompanyThatStartsWithBullet() {
        ParsedResume resume = baseResume();
        resume.getExperiences().getFirst().setCompany("- Home Depot");

        ResumeParseQualityResult result = validator.evaluate(resume);

        assertThat(result.acceptable()).isFalse();
        assertThat(issueCodes(result)).contains("experience.company_starts_with_bullet");
    }

    @Test
    void rejectsExperienceCompanyThatLooksLikeResponsibilitySentence() {
        ParsedResume resume = baseResume();
        resume.getExperiences().getFirst().setCompany("improving static asset delivery latency.");

        ResumeParseQualityResult result = validator.evaluate(resume);

        assertThat(result.acceptable()).isFalse();
        assertThat(issueCodes(result)).contains("experience.company_looks_like_bullet");
    }

    @Test
    void rejectsCategoryOnlySkills() {
        ParsedResume resume = baseResume();
        resume.setSkills(List.of("Languages:", "Frameworks:", "Tools:"));

        ResumeParseQualityResult result = validator.evaluate(resume);

        assertThat(result.acceptable()).isFalse();
        assertThat(issueCodes(result)).contains("skills.category_labels_only");
    }

    private ParsedResume baseResume() {
        Experience experience = new Experience();
        experience.setTitle("Software Engineer");
        experience.setCompany("Acme Corp");
        experience.setStartDate("Jan 2024");
        experience.setEndDate("Present");
        experience.setBullets(List.of("Built APIs serving customers"));

        ParsedResume resume = new ParsedResume();
        resume.setFullName("Jane Doe");
        resume.setEmail("jane@example.com");
        resume.setPhone("(702) 555-1234");
        resume.setLocation("Las Vegas, NV");
        resume.setSkills(List.of("Java", "React", "Spring"));
        resume.setExperiences(List.of(experience));
        return resume;
    }

    private List<String> issueCodes(ResumeParseQualityResult result) {
        return result.issues().stream()
                .map(issue -> issue.code())
                .toList();
    }
}
