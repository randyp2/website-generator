package com.webgen.webgen_backend.resume.service;

import com.webgen.webgen_backend.resume.dto.ParsedResumeDTO;
import com.webgen.webgen_backend.resume.mapper.ParsedResumeMapper;
import com.webgen.webgen_backend.resume.model.ParsedResume;
import com.webgen.webgen_backend.resume.service.confidence.ResumeConfidenceEvaluator;
import com.webgen.webgen_backend.resume.service.llm.LlmResumeParserService;
import com.webgen.webgen_backend.resume.service.quality.ResumeParseQualityIssue;
import com.webgen.webgen_backend.resume.service.quality.ResumeParseQualityResult;
import com.webgen.webgen_backend.resume.service.quality.ResumeParseQualityValidator;
import com.webgen.webgen_backend.resume.service.utils.ResumeTextExtractor;
import com.webgen.webgen_backend.resume.service.utils.TextCleaner;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ResumeParserService  {

    private static final Logger log = LoggerFactory.getLogger(ResumeParserService.class);

    // --- Low-level Parsing
    private final ResumeTextExtractor resumeTextExtractor;

    // --- Text cleaner optional;
    private final TextCleaner textCleaner;

    // --- Semantic extraction
    private final ResumeExtractionService resumeExtractionService;

    // -- Mapper
    private final ParsedResumeMapper parsedResumeMapper;

    // --- Confidence evaluation
    private final ResumeConfidenceEvaluator confidenceEvaluator;

    // --- Structural quality evaluation
    private final ResumeParseQualityValidator qualityValidator;

    // --- LLM fallback parser
    private final LlmResumeParserService llmResumeParserService;

    // --- Configuration values (injected via field injection, not constructor)
    @Value("${resume.parser.confidence-threshold:0.40}")
    private double confidenceThreshold;

    @Value("${resume.parser.llm-fallback-enabled:true}")
    private boolean llmFallbackEnabled;


    public ParsedResumeDTO parseResume(MultipartFile file, Boolean llmFallbackOverride) {
        // 1. Extract and normalize text
        String rawText = resumeTextExtractor.extract(file); // Get raw text

        // Normalize text (remove weird spacing, normalize line breaks)
        String normalizedText = textCleaner.clean(rawText);

        // 2. Parse with regex
        ParsedResume regexParsed = resumeExtractionService.extract(normalizedText);
        regexParsed.setRawText(rawText);
        regexParsed.setNormalizedText(normalizedText);

        // 3. Evaluate confidence
        double confidence = confidenceEvaluator.evaluateConfidence(regexParsed);
        double regexConfidence = confidence;
        ResumeParseQualityResult regexQualityResult = qualityValidator.evaluate(regexParsed);
        List<String> regexQualityIssueCodes = regexQualityResult.issues()
                .stream()
                .map(ResumeParseQualityIssue::code)
                .toList();

        ParsedResume finalParsed;
        String parsingMethod;

        // Per-request override takes precedence over the global config
        boolean useLlmFallback = llmFallbackOverride != null ? llmFallbackOverride : llmFallbackEnabled;

        // 4. Decision logic
        boolean confidenceAcceptable = confidence >= confidenceThreshold;
        if (confidenceAcceptable && regexQualityResult.acceptable()) {
            finalParsed = regexParsed;
            parsingMethod = "regex";
        } else if (useLlmFallback) {
            log.info(
                    "Resume regex parse selected for LLM fallback. confidence={}, threshold={}, qualityAcceptable={}, issues={}",
                    confidence,
                    confidenceThreshold,
                    regexQualityResult.acceptable(),
                    regexQualityIssueCodes
            );
            try {
                finalParsed = llmResumeParserService.parseWithLlm(rawText, normalizedText);
                confidence = confidenceEvaluator.evaluateConfidence(finalParsed);
                parsingMethod = "llm";
            } catch (Exception e) {
                log.warn(
                        "Resume LLM fallback failed. Returning regex parse. confidence={}, threshold={}, qualityAcceptable={}, issues={}, error={}",
                        regexConfidence,
                        confidenceThreshold,
                        regexQualityResult.acceptable(),
                        regexQualityIssueCodes,
                        e.getMessage()
                );
                finalParsed = regexParsed;
                parsingMethod = fallbackParsingMethod(confidenceAcceptable, regexQualityResult.acceptable());
            }
        } else {
            finalParsed = regexParsed;
            parsingMethod = fallbackParsingMethod(confidenceAcceptable, regexQualityResult.acceptable());
        }

        // 5. Store metadata
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("confidenceScore", confidence);
        metadata.put("regexConfidenceScore", regexConfidence);
        metadata.put("parsingMethod", parsingMethod);
        metadata.put("llmFallbackTriggered", parsingMethod.equals("llm"));
        metadata.put("regexQualityAcceptable", regexQualityResult.acceptable());
        metadata.put("regexQualityIssues", regexQualityIssueCodes);
        finalParsed.setMetadata(metadata);

        return parsedResumeMapper.toDto(finalParsed);
    }

    /**
     * Parses a size-validated object downloaded from private storage.
     * The adapter keeps the existing PDF and DOCX extraction pipeline unchanged.
     */
    public ParsedResumeDTO parseResume(
            byte[] content,
            String originalFilename,
            String contentType,
            Boolean llmFallbackOverride
    ) {
        return parseResume(
                new ByteArrayMultipartFile(originalFilename, contentType, content),
                llmFallbackOverride
        );
    }

    private String fallbackParsingMethod(boolean confidenceAcceptable, boolean qualityAcceptable) {
        if (confidenceAcceptable && !qualityAcceptable) {
            return "regex_low_quality";
        }
        return "regex_low_confidence";
    }
}
