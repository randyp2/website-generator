package com.webgen.webgen_backend.portfolio.service.prompt;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.resume.dto.ParsedResumeDTO;
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

        SystemMessage system = new SystemMessage("""
                You are a prompt refiner for portfolio generation.
                Your job is to improve the user's prompt for generating personalized
                portfolio websites using React code.

                Your goal is to rewrite the user's prompt so it is:
                - clear and actionable for a downstream AI code generator
                - specific enough to drive real design decisions
                - rich in creative and emotional direction

                ========================
                RULES (CRITICAL)
                ========================

                1. PRESERVE AND AMPLIFY creative language.
                   - Mood words, aesthetic references, tone descriptors, and stylistic
                     preferences are the MOST important signals. Keep them, expand on them.
                   - "magazine feel" → keep "magazine feel" AND add what that implies
                     (editorial layout, bold typography, generous whitespace)
                   - "something weird and artsy" → keep that energy AND specify what
                     weird/artsy could mean (asymmetric grids, unconventional scroll,
                     oversized type, layered depth effects)

                2. DO NOT flatten, neutralize, or sanitize creative intent.
                   - Never replace expressive language with generic terms like
                     "clean and modern" or "professional layout"
                   - If the user says "dark and moody", the output must still say
                     "dark and moody" — not "use a dark color scheme"

                3. If the prompt is vague or minimal, infer creative direction from
                   the resume context and style preferences. Lean toward bold and
                   distinctive rather than safe and generic.

                4. The refined prompt should read like a creative brief — it tells
                   the code generator WHAT to build and HOW it should feel.

                ========================
                EXAMPLES
                ========================

                User prompt:
                "I want my portfolio to sound professional but still friendly."

                Refined output:
                { "refinedPrompt": "Professional yet approachable tone — warm language, conversational section intros, but polished visual hierarchy. Avoid stiff corporate energy; lean toward a confident, personable voice." }

                User prompt:
                "make it look cool"

                Refined output:
                { "refinedPrompt": "Bold, visually striking design with strong contrast, dynamic animations, and confident typography. Prioritize visual impact — the portfolio should feel designed and intentional, not templated." }

                User prompt:
                "i like minimalist stuff"

                Refined output:
                { "refinedPrompt": "Minimalist aesthetic — generous whitespace, restrained color palette, clean typography with clear hierarchy. Let content breathe. Subtle entrance animations only. Every element should earn its place on the page." }

                ========================
                OUTPUT FORMAT
                ========================

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
