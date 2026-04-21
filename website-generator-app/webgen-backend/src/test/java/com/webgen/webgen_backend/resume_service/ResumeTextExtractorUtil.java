package com.webgen.webgen_backend.resume_service;

import com.webgen.webgen_backend.resume.service.utils.TextCleaner;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * One-time utility to extract normalized text from test resume PDFs.
 * Run main() once to generate .txt fixtures, then never again.
 *
 * Usage: Run as a Java application (main method).
 * Output: src/test/resources/resumes/*.txt files alongside the PDFs.
 */
public class ResumeTextExtractorUtil {

    public static void main(String[] args) throws Exception {
        TextCleaner cleaner = new TextCleaner();
        Path resumeDir = Paths.get("src/test/resources/resumes");

        Files.list(resumeDir)
                .filter(p -> p.toString().endsWith(".pdf"))
                .sorted()
                .forEach(pdf -> {
                    try {
                        String rawText = extractText(pdf);
                        String normalized = cleaner.clean(rawText);

                        // Write .txt file next to the PDF
                        String txtName = pdf.getFileName().toString().replace(".pdf", ".txt");
                        Path txtPath = resumeDir.resolve(txtName);
                        Files.writeString(txtPath, normalized);

                        System.out.println("Extracted: " + pdf.getFileName() + " -> " + txtName + " (" + normalized.length() + " chars)");
                    } catch (Exception e) {
                        System.err.println("FAILED: " + pdf.getFileName() + " - " + e.getMessage());
                    }
                });
    }

    private static String extractText(Path pdfPath) throws IOException {
        try (InputStream is = Files.newInputStream(pdfPath);
             PDDocument doc = Loader.loadPDF(is.readAllBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            return stripper.getText(doc);
        }
    }
}
