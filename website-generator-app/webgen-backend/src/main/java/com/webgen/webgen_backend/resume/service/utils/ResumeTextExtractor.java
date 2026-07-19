package com.webgen.webgen_backend.resume.service.utils;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;

@Component
@RequiredArgsConstructor
public class ResumeTextExtractor {

    private final PdfTextExtractor pdfTextExtractor;
    private final DocxTextExtractor docxTextExtractor;

    /**
     * Extracts raw resume text from supported upload formats.
     *
     * @param file uploaded resume file
     * @return extracted raw text
     */
    public String extract(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        ResumeFileType fileType = detectFileType(file);
        return switch (fileType) {
            case PDF -> pdfTextExtractor.extract(file);
            case DOCX -> docxTextExtractor.extract(file);
        };
    }

    private ResumeFileType detectFileType(MultipartFile file) {
        String contentType = normalize(file.getContentType());
        String filename = normalize(file.getOriginalFilename());

        if (contentType.contains("pdf") || filename.endsWith(".pdf")) {
            return ResumeFileType.PDF;
        }

        if (contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                || filename.endsWith(".docx")) {
            return ResumeFileType.DOCX;
        }

        throw new IllegalArgumentException("Unsupported resume file type. Only PDF and DOCX files are supported.");
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private enum ResumeFileType {
        PDF,
        DOCX
    }
}
