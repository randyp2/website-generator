package com.webgen.webgen_backend.resume.utils;


import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

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
        if (file == null || file.isEmpty())
            throw new IllegalArgumentException("Uploaded file is empty");

        // Load pdf into memory and store in PDDocument
        try(PDDocument document = Loader.loadPDF(file.getBytes())){

            // Initialize text-extraction engine
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true); // Reorder text based on where it is on the page

            return stripper.getText(document); // Extract raw text and return


        } catch (IOException e) {
            throw new RuntimeException("Failed to extract text from pdf", e);
        }
    }
}
