package com.webgen.webgen_backend.resume.service.utils;

import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@Component
public class DocxTextExtractor {

    /**
     * Extracts text content from a DOCX file.
     *
     * @param file uploaded resume DOCX
     * @return extracted raw text
     */
    public String extract(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        try {
            return extract(file.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("Failed to extract text from docx", e);
        }
    }

    /**
     * Extracts text content from DOCX bytes.
     *
     * @param docxBytes DOCX file bytes
     * @return extracted raw text
     */
    public String extract(byte[] docxBytes) {
        if (docxBytes == null || docxBytes.length == 0) {
            throw new IllegalArgumentException("DOCX byte payload is empty");
        }

        try (
                ByteArrayInputStream inputStream = new ByteArrayInputStream(docxBytes);
                XWPFDocument document = new XWPFDocument(inputStream);
                XWPFWordExtractor extractor = new XWPFWordExtractor(document)
        ) {
            return extractor.getText();
        } catch (IOException e) {
            throw new RuntimeException("Failed to extract text from docx", e);
        }
    }
}
