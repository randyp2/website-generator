package com.webgen.webgen_backend.portfolio.service.prompt;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.resume.dto.ParsedResumeDTO;
import com.webgen.webgen_backend.shared.prompt.PromptTemplateLoader;
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
    private final PromptTemplateLoader promptTemplateLoader;

    private static final String SYSTEM_TEMPLATE_PATH = "prompts/portfolio/prompt-refiner-system.md";

    /**
     * Calls OpenAI to rewrite the user's raw prompt into a richer creative brief
     * that the downstream portfolio generator can act on more precisely.
     * Falls back to the original prompt if the API call fails or returns blank.
     *
     * @param rawPrompt  user-supplied prompt (may be null or minimal)
     * @param resume     parsed resume used to infer creative direction when prompt is vague
     * @param stylePrefs style chat answers used as additional context
     * @return refined prompt string ready for the portfolio generator
     */
    public String refineUserPrompt(
            String rawPrompt,
            ParsedResumeDTO resume,
            Map<String, String> stylePrefs
    ) {
        System.out.println(">>> [REFINER] refineUserPrompt() started");

        if (rawPrompt == null) {
            System.out.println(">>> [REFINER] Raw prompt is null, returning default");
            return "Improve clarity and professionalism while staying faithful to the resume data.";
        }

        String resumeSummary = buildResumeSummary(resume);
        String styleSummary = stylePrefs == null ? "none" : stylePrefs.toString();

        SystemMessage system = new SystemMessage(
                promptTemplateLoader.load(SYSTEM_TEMPLATE_PATH)
        );

        UserMessage user = new UserMessage("""
                Raw prompt: %s
                Resume summary: %s
                Style prefs: %s
                """.formatted(rawPrompt, resumeSummary, styleSummary));

        Prompt prompt = new Prompt(List.of(system, user));


        // Call openai api to refine prompt;
        try {
            System.out.println(">>> [REFINER] Calling OpenAI to refine prompt...");
            long start = System.currentTimeMillis();

            ChatResponse response = openAiChatModel.call(prompt);

            System.out.println(">>> [REFINER] OpenAI refine call completed in " + (System.currentTimeMillis() - start) + "ms");

            String raw = response.getResult().getOutput().getText();

            JsonNode root = objectMapper.readTree(raw);
            String refined = root.path("refinedPrompt").asText();

            return refined == null || refined.isBlank() ? rawPrompt : refined;
        } catch (Exception e) {
            System.err.println(">>> [REFINER] Error calling OpenAI API: " + e.getMessage());
            return rawPrompt;
        }

    }


    /** Builds a compact resume summary for prompt context (name, summary, skills only). */
    private String buildResumeSummary(ParsedResumeDTO resume) {
        if (resume == null)
            return "none";

        return "Name: %s | Summary: %s | Skills: %s"
                .formatted(
                        resume.getFullName() == null ? "none" : resume.getFullName(),
                        resume.getSummary() == null ? "none" : resume.getSummary(),
                        resume.getSkills() == null ? "none" : String.join(", ", resume.getSkills())
                );
    }
}
