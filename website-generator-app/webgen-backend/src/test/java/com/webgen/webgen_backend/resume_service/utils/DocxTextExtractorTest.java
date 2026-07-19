package com.webgen.webgen_backend.resume_service.utils;

import com.webgen.webgen_backend.resume.service.utils.DocxTextExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

class DocxTextExtractorTest {

    private final DocxTextExtractor extractor = new DocxTextExtractor();

    @Test
    void extractsParagraphTextFromDocxUpload() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "resume.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                buildDocxBytes("Jane Doe", "jane@example.com", "Skills", "Java, React")
        );

        String text = extractor.extract(file);

        assertThat(text).contains("Jane Doe");
        assertThat(text).contains("jane@example.com");
        assertThat(text).contains("Java, React");
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
