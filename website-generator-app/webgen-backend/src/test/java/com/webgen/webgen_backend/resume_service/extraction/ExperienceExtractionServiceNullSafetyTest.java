package com.webgen.webgen_backend.resume_service.extraction;

import com.webgen.webgen_backend.resume.model.Experience;
import com.webgen.webgen_backend.resume.service.extraction.ExperienceExtractionService;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ExperienceExtractionServiceNullSafetyTest {

    private final ExperienceExtractionService service = new ExperienceExtractionService();

    @Test
    void returnsEmptyBulletsWhenExperienceHasNoParsedResponsibilities() {
        String text = """
                Experience
                Acme Corp Jan 2024 - Present
                Software Engineer
                Education
                UNLV
                """;

        List<Experience> results = service.extractExperience(text);

        assertThat(results).isNotEmpty();
        assertThat(results.getFirst().getBullets()).isEmpty();
    }
}
