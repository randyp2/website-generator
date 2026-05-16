package com.webgen.webgen_backend.resume.service.llm;

import com.webgen.webgen_backend.shared.prompt.PromptTemplateLoader;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Builds prompts for LLM-based resume parsing.
 */
@Service
public class ResumeParserPromptBuilder {

    private static final String SYSTEM_TEMPLATE_PATH = "prompts/resume/resume-parser-system.md";

    private final PromptTemplateLoader promptTemplateLoader;

    public ResumeParserPromptBuilder(PromptTemplateLoader promptTemplateLoader) {
        this.promptTemplateLoader = promptTemplateLoader;
    }

    /**
     * Build initial parsing prompt for LLM.
     * @param normalizedText The cleaned resume text to parse
     * @return Prompt for LLM
     */
    public Prompt buildParsePrompt(String normalizedText) {
        SystemMessage systemMessage = new SystemMessage(buildSystemMessage());
        UserMessage userMessage = new UserMessage(buildUserMessage(normalizedText));

        return new Prompt(List.of(systemMessage, userMessage));
    }

    /**
     * Build retry prompt when previous attempt failed validation.
     * @param normalizedText The cleaned resume text
     * @param previousResponse The previous LLM response that failed
     * @param errors List of validation errors from previous attempt
     * @return Prompt for retry
     */
    public Prompt buildRetryPrompt(String normalizedText, String previousResponse, List<String> errors) {
        SystemMessage systemMessage = new SystemMessage(buildSystemMessage());

        String userMessageText = buildUserMessage(normalizedText) +
            "\n\n--- RETRY REQUEST ---\n" +
            "Your previous response failed validation with these errors:\n" +
            String.join("\n", errors) + "\n\n" +
            "Previous response:\n" + previousResponse + "\n\n" +
            "Please fix these issues and provide a corrected JSON response.";

        UserMessage userMessage = new UserMessage(userMessageText);

        return new Prompt(List.of(systemMessage, userMessage));
    }

    /**
     * Build the system message defining the parsing task and output format.
     */
    private String buildSystemMessage() {
        return promptTemplateLoader.load(SYSTEM_TEMPLATE_PATH);
    }

    /**
     * Build the user message containing the resume text to parse.
     */
    private String buildUserMessage(String normalizedText) {
        return "Parse the following resume text and extract structured information as JSON:\n\n" +
               "--- RESUME TEXT ---\n" +
               normalizedText +
               "\n--- END RESUME TEXT ---\n\n" +
               "Output the extracted information as JSON following the schema provided in the system message.";
    }
}
