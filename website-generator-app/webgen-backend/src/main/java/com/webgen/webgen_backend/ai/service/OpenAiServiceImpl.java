package com.webgen.webgen_backend.ai.service;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.resume.model.FormData;
import com.webgen.webgen_backend.ai.service.OpenAiService;
import com.webgen.webgen_backend.shared.prompt.PromptTemplateLoader;
import lombok.AllArgsConstructor;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class OpenAiServiceImpl implements OpenAiService {

    private final OpenAiChatModel openAiChatModel; // Create ai chat model (provided with ai dependency)
    private final PromptTemplateLoader promptTemplateLoader;

    private static final String SYSTEM_TEMPLATE_PATH = "prompts/ai/html-generator-system.md";



    @Override
    public String generateHTMLCSSFromAi(FormData formData) {

        // Behaviour of ai model
        // System prompt - Message always comes first in chat sequence
        SystemMessage system = new SystemMessage(promptTemplateLoader.load(SYSTEM_TEMPLATE_PATH));

        // User prompt
        UserMessage user = new UserMessage(buildPrompt(formData));

        // Combine both prompts
        Prompt prompt = new Prompt(List.of(system, user));

//        System.out.println("Active model: " + openAiChatModel.getDefaultOptions().getModel());


        try {
            // Call chat model with prompt
            ChatResponse response = openAiChatModel.call(prompt);

            // Get raw response in form of a string
            // Should be a string json
            String raw = response.getResult().getOutput().getText();

            ObjectMapper mapper = new ObjectMapper(); // Initialize json parser
            JsonNode root = mapper.readTree(raw); // Return tree object of json

            String html = root.path("html").asText(); // safely extracts HTML

            if (html == null || html.isEmpty()) {
                return "⚠️ Model did not return a valid JSON structure. Raw response:\n" + raw;
            }

            return html;

        } catch (Exception e) {
            return "<html><body><h1>❌ Error generating HTML</h1><p>" + e.getMessage() + "</p></body></html>";
        }

    }


    public String buildPrompt(FormData formData) {
        return """
        Generate a single self-contained responsive HTML page with embedded CSS inside <style> tags.
        Return the result as valid JSON with the key "html" only, like:
        { "html": "<!DOCTYPE html>...</html>" }

        --- Creative & Visual Requirements ---
        • Make the site look like a professional, visually rich, and modern interactive portfolio.
        • Use creative layouts with depth and dimension — layered sections, floating cards, overlapping panels, or subtle diagonal transitions.
        • Apply glassmorphism and blurred glass panels to highlight content sections.
        • Incorporate smooth motion and transitions everywhere: fade-ins, slides, or scale-ups using CSS keyframes and transform effects.
        • Add dynamic depth through shadows, soft glows, and gradient lighting.
        • Introduce responsive hover interactions — cards lifting, buttons glowing, icons pulsing.
        • Include elegant CSS-only background animations such as:
          - Soft shifting gradient or radial glow.
          - Slow-moving light spots or blur blobs.
          - Animated vignette or gradient overlays.
        • Maintain balance and minimalism — Apple-level polish with focus on typography, spacing, and motion.
        • Use consistent transition timing and easing for smooth motion.

        --- Layout Requirements ---
        The layout should include:
        0️⃣ Navigation Bar → A visually cohesive navbar that reflects the chosen theme. 
            - Include links: Home, About, Skills, Contact, and the custom section ("%s").
            - It should be responsive and elegant, adapting seamlessly for mobile (hamburger or minimal layout).
            - Use smooth hover transitions, subtle glow or underline effects, and clear typography.
            - For Apple Style: translucent glass bar with soft white glow and blur.
            - For Neon Style: dark base with glowing neon hover highlights.
            - For Zen Style: soft gradients with calm hover fades.
            - For Minimal Style: clean white or light gray bar with simple text and minimal decoration.
            - For Cyberpunk Style: dark gradient background with neon line accents or flicker effects.

        1️⃣ Hero/Header → Prominent user name + tagline in large typography, centered or layered with animation.
        2️⃣ About Section → Animated fade-in glass card with user information.
        3️⃣ Skills Section → Animated skill badges or glowing cards that expand or pulse on hover.
        4️⃣ Contact Section → Icons for Email, GitHub, LinkedIn with hover glow or pulse effect.
        5️⃣ Custom Section → Title: %s | Content: %s (styled consistently with the theme using interactive or glowing panels)
        • Ensure all sections feel cohesive, with gradient or blurred transitions between them.
        • Must look elegant and fluid on both desktop and mobile.

        --- Theme Details ---
        Use the following theme style guide:
        %s

        --- Custom Style Overrides ---
        %s

        --- Creative Variation ---
        Design should have a unique visual identity from other generated pages — avoid reusing structure, animations, or CSS effects from previous outputs.
        Explore alternate layouts (such as side navigation, split hero sections, or staggered content flow) while preserving overall elegance.
        Incorporate a distinct artistic influence, such as cinematic lighting, scientific minimalism, or futuristic UI design — depending on the theme and user background.

        --- Layout & Style Diversity Cues ---
        • Try using asymmetry, angled dividers, or alternating section backgrounds.
        • Vary typography hierarchy and layout rhythm.
        • Experiment with unique section transitions (e.g., blur-to-clear, diagonal fade, vertical reveal).
        • Change background animation style or gradient direction to differentiate design feel.
        • Each generation should feel distinct and inspired, not templated.

        --- Moodboard Inspiration ---
        Imagine the design was inspired by the user’s story and field — translate their background and skills into motion, lighting, and color mood.
        Examples:
        - A tech student → cinematic glow, dark mode futurism.
        - A biology major → soft gradients, organic shapes, and clean lab-inspired visuals.
        - A creative designer → artistic layering and vivid animation contrasts.

        --- Anti-Repetition Rule ---
        Do not replicate layout hierarchy, section animations, or color distribution from prior generations.
        Reimagine transitions, text treatments, and visual rhythm while keeping the theme consistent.

        --- Additional Notes ---
        • Be creative — use CSS transitions, animation timing, and depth to make the design feel alive.
        • Use only HTML and CSS (no JavaScript).
        • Avoid markdown, comments, or explanations.
        • Do NOT include backticks, code fences, or text outside JSON.
        • Automatically fill any missing text or visuals with tasteful, theme-consistent placeholders.
        • Apply a random creative seed to encourage diversity across generations.

        --- User Data ---
        Name: %s
        Tagline: %s
        About: %s
        Skills: %s
        Email: %s
        GitHub: %s
        LinkedIn: %s
        """.formatted(
                formData.getCustomSectionTitle(),        // used in Navbar ("custom section" link)
                formData.getCustomSectionTitle(),        // used in Custom Section Title
                formData.getCustomSectionContent(),
                formData.getThemeField(),
                formData.getCustomStyle() == null ? "none" : formData.getCustomStyle(),
                formData.getName(),
                formData.getTagline(),
                formData.getAbout(),
                String.join(", ", formData.getSkills()),
                formData.getEmail(),
                formData.getGithub(),
                formData.getLinkedin()
        );

    }
}
