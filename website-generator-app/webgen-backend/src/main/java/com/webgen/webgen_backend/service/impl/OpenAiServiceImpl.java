package com.webgen.webgen_backend.service.impl;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.model.FormData;
import com.webgen.webgen_backend.service.OpenAiService;
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



    @Override
    public String generateHTMLCSSFromAi(FormData formData) {

        // Behaviour of ai model
        // System prompt - Message always comes first in chat sequence
        SystemMessage system = new SystemMessage("""
            You are a professional web code generator. 
            Produce a single valid HTML document with embedded CSS (<style> tags).
            Do not include markdown, code fences, or explanations.
        """);

        // User prompt
        UserMessage user = new UserMessage(buildPrompt(formData));

        // Combine both prompts
        Prompt prompt = new Prompt(List.of(system, user));




        try {
            // Call chat model with prompt
            ChatResponse response = openAiChatModel.call(prompt);

            // Get raw response in form of a string
            // Should be a string json
            String raw = response.getResult().getOutput().getContent();

            ObjectMapper mapper = new ObjectMapper(); // Initialize json parser
            JsonNode root = mapper.readTree(raw); // Return tree object of json

            String html = root.path("html").asText(); // safely extracts HTML

            if (html == null || html.isEmpty()) {
                return "⚠️ Model did not return a valid JSON structure. Raw response:\n" + raw;
            }

            return html;

        } catch (Exception e) {
            e.printStackTrace();
            return "<html><body><h1>❌ Error generating HTML</h1><p>" + e.getMessage() + "</p></body></html>";
        }

    }


    public String buildPrompt(FormData formData) {
      return  """
            Generate a single self-contained responsive HTML page with embedded CSS inside <style> tags.
            Return the result as valid JSON with the key "html" only, like:
            { "html": "<!DOCTYPE html>...</html>" }
            
            --- Creative & Visual Requirements ---
            • Make the site look like a professional interactive portfolio — visually rich and modern.
            • Include a stunning hero section with the user's name and tagline using large, bold typography.
            • Add animated gradients, glowing highlights, or blurred glassmorphism backgrounds depending on the theme.
            • Use creative color palettes, dynamic typography, and depth through shadows or blur.
            • Add hover and scroll-triggered animations (fade-ins, scale-ups, glow-on-hover).
            • Create animated section transitions or separators using CSS keyframes or transform effects.
            • Incorporate smooth motion: subtle parallax scrolling, glowing borders, and hover scaling.
            • The layout should include:
              1️⃣ Hero/Header → Prominent name + tagline with animations.
              2️⃣ About → Animated fade-in text block about the user.
              3️⃣ Skills → Animated cards or badges that glow or expand on hover.
              4️⃣ Contact → Interactive icons for email, GitHub, LinkedIn (hover glow effects).
              5️⃣ Custom Section → Title: %s | Content: %s (styled consistently with the theme)
            • Ensure all animations and layouts are responsive and perform well on mobile.
            • Use modern design trends: glassmorphism, gradient overlays, blurred panels, neon glow, or minimalist pastel cards.
            
            --- Theme Selection ---
              Use the theme "%s":
               - apple → Inspired by Apple’s hardware and UI aesthetic: luminous whites, translucent glass panels, and soft green accent glows. Rounded corners, ample whitespace, San-Francisco-style sans-serif fonts. Subtle glassmorphism layering, floating cards with realistic blur, and slow fade or slide animations that feel natural and weightless.

               - neon → High-contrast futuristic nightclub energy. Deep charcoal or near-black backgrounds with vivid cyan, magenta, and purple neon lines. Text glows softly; section borders pulse gently. Animated gradient ribbons or circuit-like dividers. Use monospace or geometric fonts and hover effects that shimmer or flicker like LED lights.

               - zen → Calm and organic. Soft gradient backgrounds in sea-green and sky-blue tones. Rounded, flowing shapes reminiscent of water and wind. Gentle opacity transitions, fade-in sections, and minimalist icons drawn with thin strokes. Balanced spacing and natural rhythm, using muted greens and creams for text.

               - minimal → Ultra-clean editorial style. White or off-white backgrounds, subtle shadows, and crisp black typography. Focus on structure and alignment: large headlines, generous spacing, precise grids. Animations are minimal and purpose-driven — fade or slide only. Fonts: Inter, Helvetica, or modern sans-serif. Use gray accents and minimal color contrast.

               - cyberpunk → Dystopian sci-fi energy. Base palette of deep violet, indigo, and magenta, contrasted by electric teal and hot pink accents. Use glowing borders, animated scanline textures, and subtle noise overlays. Cards appear to flicker into existence with keyframes. Bold techno fonts, angled separators, and motion-blur effects evoke speed and intensity.
            
            --- Custom Style Overrides ---
            %s
            
            --- Additional Notes ---
            • Must be responsive, interactive, and professional.
            • Do not use JavaScript — only HTML and CSS.
            • Avoid markdown, comments, or explanations.
            • Do NOT include backticks, code fences, or text outside JSON.
            
            --- User Data ---
            Name: %s
            Tagline: %s
            About: %s
            Skills: %s
            Email: %s
            GitHub: %s
            LinkedIn: %s
            """.formatted(
                            formData.getCustomSectionTitle(),
                            formData.getCustomSectionContent(),
                            formData.getTheme(),
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
