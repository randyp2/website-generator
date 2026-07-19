package com.webgen.webgen_backend.resume_service.llm;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.ai.config.OpenAiConfig;
import com.webgen.webgen_backend.resume.dto.ParsedResumeDTO;
import com.webgen.webgen_backend.resume.mapper.ParsedResumeMapper;
import com.webgen.webgen_backend.resume.model.ParsedResume;
import com.webgen.webgen_backend.resume.service.ResumeExtractionService;
import com.webgen.webgen_backend.resume.service.ResumeParserService;
import com.webgen.webgen_backend.resume.service.confidence.ResumeConfidenceEvaluator;
import com.webgen.webgen_backend.resume.service.extraction.ContactInfoExtractionService;
import com.webgen.webgen_backend.resume.service.extraction.EducationExtractionService;
import com.webgen.webgen_backend.resume.service.extraction.ExperienceExtractionService;
import com.webgen.webgen_backend.resume.service.extraction.ProjectExtractionService;
import com.webgen.webgen_backend.resume.service.extraction.SkillExtractionService;
import com.webgen.webgen_backend.resume.service.extraction.SummaryExtractionService;
import com.webgen.webgen_backend.resume.service.llm.LlmResumeParserService;
import com.webgen.webgen_backend.resume.service.llm.ResumeParserPromptBuilder;
import com.webgen.webgen_backend.resume.service.llm.ResumeParserResponseParser;
import com.webgen.webgen_backend.resume.service.quality.ResumeParseQualityIssue;
import com.webgen.webgen_backend.resume.service.quality.ResumeParseQualityResult;
import com.webgen.webgen_backend.resume.service.quality.ResumeParseQualityValidator;
import com.webgen.webgen_backend.resume.service.utils.DocxTextExtractor;
import com.webgen.webgen_backend.resume.service.utils.PdfTextExtractor;
import com.webgen.webgen_backend.resume.service.utils.ResumeTextExtractor;
import com.webgen.webgen_backend.resume.service.utils.TextCleaner;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Properties;

import static org.junit.jupiter.api.Assumptions.assumeTrue;

@Tag("requires-ai")
@Tag("requires-fixtures")
class LlmResumeParserServiceAiSmokeTest {

    private static final Logger log = LoggerFactory.getLogger(LlmResumeParserServiceAiSmokeTest.class);

    private static final Path RESUME_FIXTURE_DIR = Path.of("src/test/resources/resumes");
    private static final Path MAIN_PROPERTIES_PATH = Path.of("src/main/resources/application.properties");
    private static final String DEFAULT_FIXTURE_FILE = "mixed-up-order.pdf";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Properties mainProperties = loadMainProperties();
    private final PdfTextExtractor pdfTextExtractor = new PdfTextExtractor();
    private final DocxTextExtractor docxTextExtractor = new DocxTextExtractor();
    private final ResumeTextExtractor resumeTextExtractor = new TextFixtureAwareResumeTextExtractor(
            pdfTextExtractor,
            docxTextExtractor
    );
    private final TextCleaner textCleaner = new TextCleaner();
    private final ResumeExtractionService extractionService = new ResumeExtractionService(
            new SkillExtractionService(),
            new ExperienceExtractionService(),
            new ProjectExtractionService(),
            new EducationExtractionService(),
            new ContactInfoExtractionService(),
            new SummaryExtractionService()
    );
    private final ResumeConfidenceEvaluator confidenceEvaluator = new ResumeConfidenceEvaluator();
    private final ResumeParseQualityValidator qualityValidator = new ResumeParseQualityValidator();

    @Test
    void tracesMixedUpOrderResumeThroughFullParserWithRealAiModel() throws IOException {
        assumeTrue(booleanConfig("resume.parser.ai-smoke.enabled", false),
                "Set -Dresume.parser.ai-smoke.enabled=true to run the real AI smoke test.");

        String apiKey = mainString("spring.ai.openai.api-key");
        assumeTrue(!apiKey.isBlank(), "Set SPRING_AI_OPENAI_API_KEY to run the real AI smoke test.");
        assumeTrue(Files.isDirectory(RESUME_FIXTURE_DIR),
                "Add local resume fixtures under " + RESUME_FIXTURE_DIR + " to run the real AI smoke test.");

        String fixtureFile = System.getProperty("resume.parser.ai-smoke.file", DEFAULT_FIXTURE_FILE);
        Path fixture = RESUME_FIXTURE_DIR.resolve(fixtureFile);
        assumeTrue(Files.isRegularFile(fixture), "Fixture not found: " + fixture);

        ResumeParserService parserService = buildParserService();
        MockMultipartFile file = multipartFixture(fixture);
        traceRegexBaseline(file);

        long startedAt = System.nanoTime();
        ParsedResumeDTO parsedResume = parserService.parseResume(file, true);
        long elapsedMs = (System.nanoTime() - startedAt) / 1_000_000;

        log.info(
                "RESUME_AI_DEBUG final parse result. file={}, elapsedMs={}, parsingMethod={}, aiUsed={}, confidencePercent={}",
                fixture.getFileName(),
                elapsedMs,
                parsedResume.getParsingMethod(),
                "llm".equals(parsedResume.getParsingMethod()),
                percent(parsedResume.getConfidenceScore())
        );
        log.info(
                "RESUME_AI_DEBUG extracted structured resume. file={}, extracted={}",
                fixture.getFileName(),
                toJson(extractedSnapshot(parsedResume))
        );
    }

    private ResumeParserService buildParserService() {
        OpenAiConfig openAiConfig = new OpenAiConfig();
        OpenAiApi openAiApi = openAiConfig.openAiApi(mainString("spring.ai.openai.api-key"));
        OpenAiChatModel resumeParserModel = openAiConfig.resumeParserChatModel(
                openAiApi,
                mainString("spring.ai.openai.resume-parser.model"),
                mainInt("spring.ai.openai.resume-parser.max-tokens"),
                mainDouble("spring.ai.openai.resume-parser.temperature")
        );

        LlmResumeParserService llmResumeParserService = new LlmResumeParserService(
                resumeParserModel,
                new ResumeParserPromptBuilder(),
                new ResumeParserResponseParser(objectMapper)
        );
        ReflectionTestUtils.setField(
                llmResumeParserService,
                "maxRetries",
                mainInt("resume.parser.max-retries")
        );

        ResumeParserService parserService = new ResumeParserService(
                resumeTextExtractor,
                textCleaner,
                extractionService,
                Mappers.getMapper(ParsedResumeMapper.class),
                confidenceEvaluator,
                qualityValidator,
                llmResumeParserService
        );
        ReflectionTestUtils.setField(
                parserService,
                "confidenceThreshold",
                mainDouble("resume.parser.confidence-threshold")
        );
        ReflectionTestUtils.setField(
                parserService,
                "llmFallbackEnabled",
                mainBoolean("resume.parser.llm-fallback-enabled")
        );

        log.info(
                "RESUME_AI_DEBUG using main resume parser config. model={}, maxTokens={}, temperature={}, confidenceThreshold={}, maxRetries={}, fixtureDefault={}",
                mainString("spring.ai.openai.resume-parser.model"),
                mainInt("spring.ai.openai.resume-parser.max-tokens"),
                mainDouble("spring.ai.openai.resume-parser.temperature"),
                mainDouble("resume.parser.confidence-threshold"),
                mainInt("resume.parser.max-retries"),
                DEFAULT_FIXTURE_FILE
        );

        return parserService;
    }

    private void traceRegexBaseline(MultipartFile file) {
        String rawText = resumeTextExtractor.extract(file);
        String normalizedText = textCleaner.clean(rawText);
        ParsedResume regexParsed = extractionService.extract(normalizedText);
        double confidence = confidenceEvaluator.evaluateConfidence(regexParsed);
        ResumeParseQualityResult qualityResult = qualityValidator.evaluate(regexParsed);
        List<String> qualityIssues = qualityResult.issues()
                .stream()
                .map(ResumeParseQualityIssue::code)
                .toList();

        log.info(
                "RESUME_AI_DEBUG regex baseline. file={}, rawChars={}, normalizedChars={}, confidencePercent={}, qualityAcceptable={}, qualityIssues={}",
                file.getOriginalFilename(),
                rawText.length(),
                normalizedText.length(),
                percent(confidence),
                qualityResult.acceptable(),
                qualityIssues
        );
        log.info(
                "RESUME_AI_DEBUG regex extracted summary. file={}, extracted={}",
                file.getOriginalFilename(),
                toJson(extractedSnapshot(regexParsed))
        );
    }

    private MockMultipartFile multipartFixture(Path fixture) throws IOException {
        String extension = extension(fixture);
        return new MockMultipartFile(
                "file",
                fixture.getFileName().toString(),
                contentType(extension),
                Files.readAllBytes(fixture)
        );
    }

    private Map<String, Object> extractedSnapshot(ParsedResume resume) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("fullName", resume.getFullName());
        snapshot.put("email", resume.getEmail());
        snapshot.put("phone", resume.getPhone());
        snapshot.put("location", resume.getLocation());
        snapshot.put("summary", resume.getSummary());
        snapshot.put("skills", resume.getSkills());
        snapshot.put("experiences", resume.getExperiences());
        snapshot.put("projects", resume.getProjects());
        snapshot.put("educations", resume.getEducations());
        return snapshot;
    }

    private Map<String, Object> extractedSnapshot(ParsedResumeDTO resume) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("fullName", resume.getFullName());
        snapshot.put("email", resume.getEmail());
        snapshot.put("phone", resume.getPhone());
        snapshot.put("location", resume.getLocation());
        snapshot.put("summary", resume.getSummary());
        snapshot.put("skills", resume.getSkills());
        snapshot.put("experiences", resume.getExperiences());
        snapshot.put("projects", resume.getProjects());
        snapshot.put("educations", resume.getEducations());
        return snapshot;
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(value);
        } catch (JsonProcessingException e) {
            return String.valueOf(value);
        }
    }

    private String percent(Double score) {
        if (score == null) {
            return "n/a";
        }
        return String.format(Locale.ROOT, "%.1f%%", score * 100.0);
    }

    private String percent(double score) {
        return String.format(Locale.ROOT, "%.1f%%", score * 100.0);
    }

    private String extension(Path path) {
        String filename = path.getFileName().toString().toLowerCase(Locale.ROOT);
        int extensionStart = filename.lastIndexOf('.');
        return extensionStart == -1 ? "" : filename.substring(extensionStart + 1);
    }

    private String contentType(String extension) {
        return switch (extension) {
            case "pdf" -> "application/pdf";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            default -> "text/plain";
        };
    }

    private String mainString(String key) {
        String value = System.getProperty(key);
        if (value == null || value.isBlank()) {
            value = mainProperties.getProperty(key, "");
        }
        return resolvePlaceholders(value);
    }

    private boolean mainBoolean(String key) {
        return Boolean.parseBoolean(mainString(key));
    }

    private int mainInt(String key) {
        return Integer.parseInt(mainString(key));
    }

    private double mainDouble(String key) {
        return Double.parseDouble(mainString(key));
    }

    private boolean booleanConfig(String key, boolean defaultValue) {
        return Boolean.parseBoolean(System.getProperty(key, Boolean.toString(defaultValue)));
    }

    private String resolvePlaceholders(String value) {
        if (value == null || !value.startsWith("${") || !value.endsWith("}")) {
            return Objects.requireNonNullElse(value, "");
        }

        String envName = value.substring(2, value.length() - 1);
        return Objects.requireNonNullElse(System.getenv(envName), "");
    }

    private Properties loadMainProperties() {
        Properties properties = new Properties();
        if (!Files.isRegularFile(MAIN_PROPERTIES_PATH)) {
            return properties;
        }

        try (InputStream inputStream = Files.newInputStream(MAIN_PROPERTIES_PATH)) {
            properties.load(inputStream);
            return properties;
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load main application properties", e);
        }
    }

    private static final class TextFixtureAwareResumeTextExtractor extends ResumeTextExtractor {

        TextFixtureAwareResumeTextExtractor(
                PdfTextExtractor pdfTextExtractor,
                DocxTextExtractor docxTextExtractor
        ) {
            super(pdfTextExtractor, docxTextExtractor);
        }

        @Override
        public String extract(MultipartFile file) {
            String filename = file.getOriginalFilename();
            if (filename != null && filename.toLowerCase(Locale.ROOT).endsWith(".txt")) {
                try {
                    return new String(file.getBytes(), StandardCharsets.UTF_8);
                } catch (IOException e) {
                    throw new IllegalStateException("Failed to read text fixture", e);
                }
            }
            return super.extract(file);
        }
    }
}
