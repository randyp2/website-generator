package com.webgen.webgen_backend.resume;

import com.webgen.webgen_backend.dto.resume.ParsedResumeDTO;
import com.webgen.webgen_backend.mapper.ParsedResumeMapper;
import com.webgen.webgen_backend.model.ParsedResume;
import com.webgen.webgen_backend.resume.utils.PdfTextExtractor;
import com.webgen.webgen_backend.resume.utils.TextCleaner;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@AllArgsConstructor
public class ResumeParserService  {

    // --- Low-level Parsing
    private final PdfTextExtractor pdfTextExtractor;

    // --- Text cleaner optional;
    private final TextCleaner textCleaner;

    // --- Semantic extraction
    private final ResumeExtractionService resumeExtractionService;

    // -- Mapper
    private final ParsedResumeMapper parsedResumeMapper;


    public ParsedResumeDTO parseResume(MultipartFile file) {

        String rawText = pdfTextExtractor.extract(file); // Get raw text

        // Normalize text (remove weird spacing, normalize line breaks)
        String normalizedText = textCleaner.clean(rawText);


        ParsedResume parsedResume = resumeExtractionService.extract(normalizedText);
        parsedResume.setRawText(rawText);


        System.out.println("Raw text: " + rawText);
        System.out.println();
        System.out.println("Extracted skills section: " + parsedResume.getSkills());
        // resumeExtractionService.extract



        return parsedResumeMapper.toDto(parsedResume);
    }
}
