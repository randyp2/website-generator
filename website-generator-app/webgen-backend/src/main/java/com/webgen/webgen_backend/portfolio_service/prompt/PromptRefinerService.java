package com.webgen.webgen_backend.portfolio_service.prompt;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.dto.resume.ParsedResumeDTO;
import com.webgen.webgen_backend.model.ParsedResume;
import lombok.AllArgsConstructor;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class PromptRefinerService {

    private final OpenAiChatModel openAiChatModel;
    private final ObjectMapper objectMapper;

    public String refineUserPrompt(
            String rawPrompt,
            ParsedResumeDTO resume,
            Map<String, String> stylePrefs
    ) {
        if (rawPrompt == null)
            return "Improve clarity and professionalism while staying faithful to the resume data.";

        String resumeSummary = buildResumeSummary(resume);
        String styleSummary = stylePrefs == null ? "none" : stylePrefs.toString();

        SystemMessage system = new SystemMessage("""
                You are a prompt refiner for portfolio generation.
                Your job is to improve user's prompt for generating personalize portfolios using react code.
                
                Your job is to rewrite the user's prompt so it is:
                - clear
                - specific
                - actionable
                - detailed
                
                
                Rules:
                - Preserve the user's original intent.
                - If the prompt is vague, clarify it without adding new ideas.
                
                Example:
                
                User prompt:
                "I want my portfolio to sound professional but still friendly."
                
                Refined output:
                { "refinedPrompt": "Use a professional yet approachable tone across all portfolio content." }
                
                Output format:
                Return valid JSON ONLY with exactly one field:
                { "refinedPrompt": "..." }
                
                No explanations, no markdown, no extra text.
                """);

        UserMessage user = new UserMessage("""
                Raw prompt: %s
                Resume summary: %s
                Style prefs: %s
                """.formatted(rawPrompt, resumeSummary, styleSummary));

        Prompt prompt = new Prompt(List.of(system, user));


        // Call openai api to refine prompt;
        try {
            ChatResponse response = openAiChatModel.call(prompt);
            String raw = response.getResult().getOutput().getText();
            JsonNode root = objectMapper.readTree(raw);
            String refined = root.path("refinedPrompt").asText();
            return refined == null || refined.isBlank() ? rawPrompt : refined;
        } catch (Exception e) {
            System.err.println("Error calling openai api");
            return rawPrompt;
        }

    }


    /**
     *  Build a brief summary of resume
     *  Important fields for context: Name, Summary, Skills
     * @param resume - parsed resume
     * @return Summary of resume
     */
    private String buildResumeSummary(ParsedResumeDTO resume) {
        if (resume == null)
            return "none";

        return "Name: %s | Summary: %s | Skills: %s"
                .formatted(
                        safe(resume.getFullName()),
                        safe(resume.getSummary()),
                        resume.getSkills() == null ? "none" : String.join(", ", resume.getSkills())
                );
    }

    // Helper to normalize null
    private String safe(String text) {
        return text == null ? "none" : text;
    }
}
