package com.webgen.webgen_backend.resume_service;

import com.webgen.webgen_backend.resume.dto.ParsedResumeDTO;
import com.webgen.webgen_backend.resume.mapper.ParsedResumeMapper;
import com.webgen.webgen_backend.resume.model.Education;
import com.webgen.webgen_backend.resume.model.Experience;
import com.webgen.webgen_backend.resume.model.ParsedResume;
import com.webgen.webgen_backend.resume.model.Project;
import com.webgen.webgen_backend.resume.service.ResumeExtractionService;
import com.webgen.webgen_backend.resume.service.ResumeParserService;
import com.webgen.webgen_backend.resume.service.confidence.ResumeConfidenceEvaluator;
import com.webgen.webgen_backend.resume.service.llm.LlmResumeParserService;
import com.webgen.webgen_backend.resume.service.quality.ResumeParseQualityValidator;
import com.webgen.webgen_backend.resume.service.utils.ResumeTextExtractor;
import com.webgen.webgen_backend.resume.service.utils.TextCleaner;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ResumeParserServiceQualityFallbackTest {

    @Test
    void usesLlmFallbackWhenRegexParseHasHighConfidenceButMalformedQuality() {
        StubResumeTextExtractor textExtractor = new StubResumeTextExtractor("raw resume text");
        StubTextCleaner textCleaner = new StubTextCleaner("normalized resume text");
        StubResumeExtractionService extractionService = new StubResumeExtractionService(highConfidenceMalformedResume());
        StubLlmResumeParserService llmService = new StubLlmResumeParserService(highConfidenceValidResume());
        ResumeParserService service = buildService(textExtractor, textCleaner, extractionService, llmService);

        MockMultipartFile file = resumeFile();

        ParsedResumeDTO result = service.parseResume(file, true);

        assertThat(result.getParsingMethod()).isEqualTo("llm");
        assertThat(result.getFullName()).isEqualTo("Jane Doe");
        assertThat(llmService.wasCalled()).isTrue();
        assertThat(llmService.rawText()).isEqualTo("raw resume text");
        assertThat(llmService.normalizedText()).isEqualTo("normalized resume text");
    }

    @Test
    void reportsLowQualityRegexWhenFallbackIsDisabled() {
        StubResumeTextExtractor textExtractor = new StubResumeTextExtractor("raw resume text");
        StubTextCleaner textCleaner = new StubTextCleaner("normalized resume text");
        StubResumeExtractionService extractionService = new StubResumeExtractionService(highConfidenceMalformedResume());
        StubLlmResumeParserService llmService = new StubLlmResumeParserService(highConfidenceValidResume());
        ResumeParserService service = buildService(textExtractor, textCleaner, extractionService, llmService);

        MockMultipartFile file = resumeFile();

        ParsedResumeDTO result = service.parseResume(file, false);

        assertThat(result.getParsingMethod()).isEqualTo("regex_low_quality");
        assertThat(result.getFullName()).isEqualTo("Robert Porchas Email");
        assertThat(llmService.wasCalled()).isFalse();
    }

    private ResumeParserService buildService(
            ResumeTextExtractor textExtractor,
            TextCleaner textCleaner,
            ResumeExtractionService extractionService,
            LlmResumeParserService llmService
    ) {
        ResumeParserService service = new ResumeParserService(
                textExtractor,
                textCleaner,
                extractionService,
                Mappers.getMapper(ParsedResumeMapper.class),
                new ResumeConfidenceEvaluator(),
                new ResumeParseQualityValidator(),
                llmService
        );
        ReflectionTestUtils.setField(service, "confidenceThreshold", 0.40);
        ReflectionTestUtils.setField(service, "llmFallbackEnabled", true);
        return service;
    }

    private MockMultipartFile resumeFile() {
        return new MockMultipartFile("file", "resume.pdf", "application/pdf", new byte[] {1, 2, 3});
    }

    private ParsedResume highConfidenceMalformedResume() {
        ParsedResume resume = highConfidenceValidResume();
        resume.setFullName("Robert Porchas Email");
        resume.setLocation("Nevada, Las");
        resume.getExperiences().getFirst().setCompany("- Home Depot");
        return resume;
    }

    private ParsedResume highConfidenceValidResume() {
        Experience experience = new Experience();
        experience.setTitle("Software Engineer");
        experience.setCompany("Acme Corp");
        experience.setStartDate("Jan 2024");
        experience.setEndDate("Present");
        experience.setBullets(List.of("Built APIs serving customers"));

        Project project = new Project();
        project.setHeader("Portfolio Generator");

        Education education = new Education();
        education.setInstitution("UNLV");
        education.setDegree("B.S. Computer Science");

        ParsedResume resume = new ParsedResume();
        resume.setFullName("Jane Doe");
        resume.setEmail("jane@example.com");
        resume.setPhone("(702) 555-1234");
        resume.setLocation("Las Vegas, NV");
        resume.setSummary("Software engineer building reliable web platforms for growing teams.");
        resume.setSkills(List.of("Java", "React", "Spring"));
        resume.setExperiences(List.of(experience));
        resume.setProjects(List.of(project));
        resume.setEducations(List.of(education));
        return resume;
    }

    private static class StubResumeTextExtractor extends ResumeTextExtractor {
        private final String rawText;

        StubResumeTextExtractor(String rawText) {
            super(null, null);
            this.rawText = rawText;
        }

        @Override
        public String extract(org.springframework.web.multipart.MultipartFile file) {
            return rawText;
        }
    }

    private static class StubTextCleaner extends TextCleaner {
        private final String normalizedText;

        StubTextCleaner(String normalizedText) {
            this.normalizedText = normalizedText;
        }

        @Override
        public String clean(String rawText) {
            return normalizedText;
        }
    }

    private static class StubResumeExtractionService extends ResumeExtractionService {
        private final ParsedResume parsedResume;

        StubResumeExtractionService(ParsedResume parsedResume) {
            super(null, null, null, null, null, null);
            this.parsedResume = parsedResume;
        }

        @Override
        public ParsedResume extract(String normalizedText) {
            return parsedResume;
        }
    }

    private static class StubLlmResumeParserService extends LlmResumeParserService {
        private final ParsedResume parsedResume;
        private boolean called;
        private String rawText;
        private String normalizedText;

        StubLlmResumeParserService(ParsedResume parsedResume) {
            super(null, null, null);
            this.parsedResume = parsedResume;
        }

        @Override
        public ParsedResume parseWithLlm(String rawText, String normalizedText) {
            this.called = true;
            this.rawText = rawText;
            this.normalizedText = normalizedText;
            return parsedResume;
        }

        boolean wasCalled() {
            return called;
        }

        String rawText() {
            return rawText;
        }

        String normalizedText() {
            return normalizedText;
        }
    }
}
