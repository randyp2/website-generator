package com.webgen.webgen_backend.resume.service.llm;

import com.webgen.webgen_backend.resume.model.ParsedResume;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for parsing resumes using LLM when regex confidence is low.
 * Includes retry logic with validation.
 */
@Service
public class LlmResumeParserService {

    private static final Logger log = LoggerFactory.getLogger(LlmResumeParserService.class);

    private final ChatModel resumeParserModel;

    private final ResumeParserPromptBuilder promptBuilder;
    private final ResumeParserResponseParser responseParser;

    @Value("${resume.parser.max-retries:3}")
    private int maxRetries;

    public LlmResumeParserService(
            @Qualifier("resumeParserModel") ChatModel resumeParserModel,
            ResumeParserPromptBuilder promptBuilder,
            ResumeParserResponseParser responseParser
    ) {
        this.resumeParserModel = resumeParserModel;
        this.promptBuilder = promptBuilder;
        this.responseParser = responseParser;
    }

    /**
     * Parse resume using LLM with retry logic.
     * @param rawText The original extracted text from PDF
     * @param normalizedText The cleaned/normalized text
    * @return ParsedResume object
     * @throws IllegalStateException if all retries fail
     */
    public ParsedResume parseWithLlm(String rawText, String normalizedText) {
        ParsedResume parsedResume = null;
        String rawJson = null;
        List<String> validationErrors = new ArrayList<>();
        int attempt = 0;

        while (attempt < maxRetries) {
            attempt++;

            try {
                log.debug(
                        "Resume LLM parse attempt started. attempt={}, maxRetries={}, normalizedChars={}",
                        attempt,
                        maxRetries,
                        normalizedText == null ? 0 : normalizedText.length()
                );

                // Build prompt (initial or retry)
                Prompt prompt;
                if (validationErrors.isEmpty()) {
                    prompt = promptBuilder.buildParsePrompt(normalizedText);
                } else {
                    prompt = promptBuilder.buildRetryPrompt(normalizedText, rawJson, validationErrors);
                }

                // Call configured chat model
                ChatResponse response = resumeParserModel.call(prompt);

                // Extract response text
                rawJson = response.getResult().getOutput().getText();
                log.debug(
                        "Resume LLM parse attempt returned response. attempt={}, responseChars={}",
                        attempt,
                        rawJson == null ? 0 : rawJson.length()
                );

                // Parse JSON response
                parsedResume = responseParser.parseResponse(rawJson);

                // Validate response
                responseParser.validateResponse(parsedResume);

                // Success - set raw text and return
                parsedResume.setRawText(rawText);
                parsedResume.setNormalizedText(normalizedText);

                log.debug("Resume LLM parse attempt succeeded. attempt={}", attempt);

                return parsedResume;

            } catch (Exception e) {
                validationErrors.clear();
                validationErrors.add(e.getMessage());
                log.debug(
                        "Resume LLM parse attempt failed validation. attempt={}, maxRetries={}, error={}",
                        attempt,
                        maxRetries,
                        e.getMessage()
                );

                // If this is the last attempt, throw exception
                if (attempt >= maxRetries) {
                    throw new IllegalStateException(
                        "Failed to parse resume with LLM after " + maxRetries + " attempts. Last error: " + e.getMessage(),
                        e
                    );
                }
            }
        }

        // Should never reach here, but just in case
        throw new IllegalStateException("Failed to parse resume with LLM after " + maxRetries + " attempts");
    }
}
