package com.webgen.webgen_backend.resume.service.utils;


import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import java.io.IOException;
import java.util.Objects;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

// Simply convert pdf to raw text
@Component
public class PdfTextExtractor {

    /**
     * Extracts text content from a PDF file.
     *
     * @param file uploaded resume PDF
     * @return extracted raw text
     */
    public String extract(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }
        try {
            return extract(file.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("Failed to extract text from pdf", e);
        }
    }

    /**
     * Extracts text content from PDF bytes.
     * Shared by resume parsing and other services that read files from object storage.
     */
    public String extract(byte[] pdfBytes) {
        if (pdfBytes == null || pdfBytes.length == 0) {
            throw new IllegalArgumentException("PDF byte payload is empty");
        }

        try (PDDocument document = Loader.loadPDF(Objects.requireNonNull(pdfBytes))) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            return stripper.getText(document);
        } catch (IOException e) {
            throw new RuntimeException("Failed to extract text from pdf", e);
        }
    }
}
