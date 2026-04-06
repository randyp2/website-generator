package com.webgen.webgen_backend.resume_service;

import com.webgen.webgen_backend.dto.resume.ParsedResumeDTO;
import com.webgen.webgen_backend.mapper.ParsedResumeMapper;
import com.webgen.webgen_backend.model.ParsedResume;
import com.webgen.webgen_backend.resume_service.confidence.ResumeConfidenceEvaluator;
import com.webgen.webgen_backend.resume_service.llm.LlmResumeParserService;
import com.webgen.webgen_backend.resume_service.utils.PdfTextExtractor;
import com.webgen.webgen_backend.resume_service.utils.TextCleaner;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ResumeParserService  {

    // --- Low-level Parsing
    private final PdfTextExtractor pdfTextExtractor;

    // --- Text cleaner optional;
    private final TextCleaner textCleaner;

    // --- Semantic extraction
    private final ResumeExtractionService resumeExtractionService;

    // -- Mapper
    private final ParsedResumeMapper parsedResumeMapper;

    // --- Confidence evaluation
    private final ResumeConfidenceEvaluator confidenceEvaluator;

    // --- LLM fallback parser
    private final LlmResumeParserService llmResumeParserService;

    // --- Configuration values (injected via field injection, not constructor)
    @Value("${resume.parser.confidence-threshold:0.40}")
    private double confidenceThreshold;

    @Value("${resume.parser.llm-fallback-enabled:true}")
    private boolean llmFallbackEnabled;


    public ParsedResumeDTO parseResume(MultipartFile file) {
        // 1. Extract and normalize text
        String rawText = pdfTextExtractor.extract(file); // Get raw text

        // Normalize text (remove weird spacing, normalize line breaks)
        String normalizedText = textCleaner.clean(rawText);

        // 2. Parse with regex
        ParsedResume regexParsed = resumeExtractionService.extract(normalizedText);
        regexParsed.setRawText(rawText);
        regexParsed.setNormalizedText(normalizedText);

        // 3. Evaluate confidence
        double confidence = confidenceEvaluator.evaluateConfidence(regexParsed);

        ParsedResume finalParsed;
        String parsingMethod;

        // 4. Decision logic
        if (confidence >= confidenceThreshold) {
            finalParsed = regexParsed;
            parsingMethod = "regex";
        } else if (llmFallbackEnabled) {
            try {
                finalParsed = llmResumeParserService.parseWithLlm(rawText, normalizedText);
                confidence = confidenceEvaluator.evaluateConfidence(finalParsed);
                parsingMethod = "llm";
            } catch (Exception e) {
                finalParsed = regexParsed;
                parsingMethod = "regex_low_confidence";
            }
        } else {
            finalParsed = regexParsed;
            parsingMethod = "regex_low_confidence";
        }

        // 5. Store metadata
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("confidenceScore", confidence);
        metadata.put("parsingMethod", parsingMethod);
        metadata.put("llmFallbackTriggered", parsingMethod.equals("llm"));
        finalParsed.setMetadata(metadata);

        return parsedResumeMapper.toDto(finalParsed);
    }
}
