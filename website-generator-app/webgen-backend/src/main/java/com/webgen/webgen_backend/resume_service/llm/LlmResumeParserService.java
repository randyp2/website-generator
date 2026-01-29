package com.webgen.webgen_backend.resume_service.llm;

import com.webgen.webgen_backend.model.ParsedResume;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for parsing resumes using LLM when regex confidence is low.
 * Includes retry logic with validation.
 */
@Service
@RequiredArgsConstructor
public class LlmResumeParserService {

    @Resource(name = "resumeParserModel")
    private final OpenAiChatModel resumeParserModel;

    private final ResumeParserPromptBuilder promptBuilder;
    private final ResumeParserResponseParser responseParser;

    @Value("${resume.parser.max-retries:3}")
    private int maxRetries;

    /**
     * Parse resume using LLM with retry logic.
     * @param rawText The original extracted text from PDF
     * @param normalizedText The cleaned/normalized text
     * @return ParsedResume object
     * @throws IllegalStateException if all retries fail
     */
    public ParsedResume parseWithLlm(String rawText, String normalizedText) {
        System.out.println(">>> [RESUME LLM] parseWithLlm() started");
        System.out.println(">>> [RESUME LLM] Normalized text length: " + (normalizedText != null ? normalizedText.length() : 0));

        ParsedResume parsedResume = null;
        String rawJson = null;
        List<String> validationErrors = new ArrayList<>();
        int attempt = 0;

        while (attempt < maxRetries) {
            attempt++;
            System.out.println(">>> [RESUME LLM] Attempt " + attempt + " of " + maxRetries);

            try {
                // Build prompt (initial or retry)
                Prompt prompt;
                if (validationErrors.isEmpty()) {
                    System.out.println(">>> [RESUME LLM] Building initial prompt...");
                    prompt = promptBuilder.buildParsePrompt(normalizedText);
                } else {
                    System.out.println(">>> [RESUME LLM] Building retry prompt with errors: " + validationErrors);
                    prompt = promptBuilder.buildRetryPrompt(normalizedText, rawJson, validationErrors);
                }

                // Call OpenAI
                System.out.println(">>> [RESUME LLM] Calling OpenAI chat model...");
                long aiStart = System.currentTimeMillis();
                ChatResponse response = resumeParserModel.call(prompt);
                System.out.println(">>> [RESUME LLM] OpenAI call completed in " + (System.currentTimeMillis() - aiStart) + "ms");

                // Extract response text
                rawJson = response.getResult().getOutput().getText();
                System.out.println(">>> [RESUME LLM] Raw JSON response length: " + (rawJson != null ? rawJson.length() : 0));

                // Parse JSON response
                System.out.println(">>> [RESUME LLM] Parsing JSON response...");
                parsedResume = responseParser.parseResponse(rawJson);

                // Validate response
                System.out.println(">>> [RESUME LLM] Validating parsed resume...");
                responseParser.validateResponse(parsedResume);

                // Success - set raw text and return
                parsedResume.setRawText(rawText);
                parsedResume.setNormalizedText(normalizedText);

                System.out.println(">>> [RESUME LLM] Parsing succeeded on attempt " + attempt);
                return parsedResume;

            } catch (Exception e) {
                System.err.println(">>> [RESUME LLM] Attempt " + attempt + " failed: " + e.getMessage());
                validationErrors.clear();
                validationErrors.add(e.getMessage());

                // If this is the last attempt, throw exception
                if (attempt >= maxRetries) {
                    System.err.println(">>> [RESUME LLM] All " + maxRetries + " attempts failed");
                    throw new IllegalStateException(
                        "Failed to parse resume with LLM after " + maxRetries + " attempts. Last error: " + e.getMessage(),
                        e
                    );
                }

                // Otherwise, continue to next attempt
                System.out.println(">>> [RESUME LLM] Retrying...");
            }
        }

        // Should never reach here, but just in case
        throw new IllegalStateException("Failed to parse resume with LLM after " + maxRetries + " attempts");
    }
}
