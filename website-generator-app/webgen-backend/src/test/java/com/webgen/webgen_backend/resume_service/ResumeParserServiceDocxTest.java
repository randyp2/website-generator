package com.webgen.webgen_backend.resume_service;

import com.webgen.webgen_backend.resume.dto.ParsedResumeDTO;
import com.webgen.webgen_backend.resume.mapper.ParsedResumeMapper;
import com.webgen.webgen_backend.resume.service.ResumeExtractionService;
import com.webgen.webgen_backend.resume.service.ResumeParserService;
import com.webgen.webgen_backend.resume.service.confidence.ResumeConfidenceEvaluator;
import com.webgen.webgen_backend.resume.service.extraction.ContactInfoExtractionService;
import com.webgen.webgen_backend.resume.service.extraction.EducationExtractionService;
import com.webgen.webgen_backend.resume.service.extraction.ExperienceExtractionService;
import com.webgen.webgen_backend.resume.service.extraction.ProjectExtractionService;
import com.webgen.webgen_backend.resume.service.extraction.SkillExtractionService;
import com.webgen.webgen_backend.resume.service.extraction.SummaryExtractionService;
import com.webgen.webgen_backend.resume.service.quality.ResumeParseQualityValidator;
import com.webgen.webgen_backend.resume.service.utils.DocxTextExtractor;
import com.webgen.webgen_backend.resume.service.utils.PdfTextExtractor;
import com.webgen.webgen_backend.resume.service.utils.ResumeTextExtractor;
import com.webgen.webgen_backend.resume.service.utils.TextCleaner;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

class ResumeParserServiceDocxTest {

    private final ResumeParserService service = new ResumeParserService(
            new ResumeTextExtractor(new PdfTextExtractor(), new DocxTextExtractor()),
            new TextCleaner(),
            new ResumeExtractionService(
                    new SkillExtractionService(),
                    new ExperienceExtractionService(),
                    new ProjectExtractionService(),
                    new EducationExtractionService(),
                    new ContactInfoExtractionService(),
                    new SummaryExtractionService()
            ),
            Mappers.getMapper(ParsedResumeMapper.class),
            new ResumeConfidenceEvaluator(),
            new ResumeParseQualityValidator(),
            null
    );

    @Test
    void parsesStructuredResumeDataFromDocxUpload() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "resume.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                buildDocxBytes(
                        "Jane Doe",
                        "jane@example.com",
                        "(702) 555-1234",
                        "Las Vegas, NV",
                        "",
                        "Summary",
                        "Software engineer building reliable web platforms for growing teams.",
                        "",
                        "Skills",
                        "Java, React, Spring",
                        "",
                        "Experience",
                        "Acme Corp Jan 2024 - Present",
                        "Software Engineer Las Vegas, NV",
                        "- Built APIs serving 100 customers",
                        "",
                        "Education",
                        "University of Nevada, Las Vegas",
                        "B.S. Computer Science May 2025"
                )
        );

        ParsedResumeDTO resume = service.parseResume(file, false);

        assertThat(resume.getFullName()).isEqualTo("Jane Doe");
        assertThat(resume.getEmail()).isEqualTo("jane@example.com");
        assertThat(resume.getSkills()).contains("Java", "React", "Spring");
        assertThat(resume.getExperiences()).hasSize(1);
        assertThat(resume.getExperiences().getFirst().getBullets())
                .contains("Built APIs serving 100 customers");
        assertThat(resume.getParsingMethod()).isEqualTo("regex");
    }

    private byte[] buildDocxBytes(String... lines) throws IOException {
        try (
                XWPFDocument document = new XWPFDocument();
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream()
        ) {
            for (String line : lines) {
                document.createParagraph().createRun().setText(line);
            }
            document.write(outputStream);
            return outputStream.toByteArray();
        }
    }
}
