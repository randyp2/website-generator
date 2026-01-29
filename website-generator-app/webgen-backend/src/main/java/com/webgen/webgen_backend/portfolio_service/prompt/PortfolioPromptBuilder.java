package com.webgen.webgen_backend.portfolio_service.prompt;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.dto.portfolio.AssetDTO;
import com.webgen.webgen_backend.dto.portfolio.PortfolioGenerateRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.PortfolioGenerateResponseDTO;
import com.webgen.webgen_backend.dto.portfolio.builder.ValidationResult;
import com.webgen.webgen_backend.dto.resume.ParsedResumeDTO;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.User;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortfolioPromptBuilder {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Prompt buildOneShotPrompt(PortfolioGenerateRequestDTO req, String refinedPrompt) {

        ParsedResumeDTO resume = req.getResume();
        String stylePrefs = formatStylePrefs(req.getStylePrefs());

        String assetsJson = serializeAssets(req.getAssets());

        // --- Construct system and user message
        SystemMessage system = new SystemMessage("""
                You are an AI software engineer working inside the PortfolioAI system.
                
                Your task is to generate an INITIAL, ONE-SHOT portfolio composed of
                multiple independent sections.
                
                You must output JSON ONLY, following the exact schema below.
                Do NOT include markdown, explanations, comments, backticks, or extra text
                outside of the defined JSON fields.
                
                ========================
                ARCHITECTURAL RULES
                ========================
                
                1. Scope
                - Generate SECTION-LEVEL artifacts only.
                - Do NOT generate App.tsx, page-level layout, routing, or data fetching.
                - Do NOT assume control over global structure.
                
                2. Section isolation
                - Each section must be fully self-contained.
                - Sections must NOT reference or depend on each other.
                - Sections must be independently renderable.
                - Each section MUST render a top-level element with id equal to its sectionKey
                  (e.g. sectionKey "projects" → id="projects")
                
                3. React contract (CRITICAL)
                - The `data` prop is ALWAYS guaranteed to be present.
                - Do NOT use optional chaining (e.g. data?.field).
                - Do NOT treat `data` as nullable or undefined.
                - Each section MUST be a valid React function component.
                - Each section MUST accept exactly ONE prop named `data`.
                - Do NOT add additional props.
                - Treat `data` as read-only input.
                - Do NOT use global state, context, or stores.
                
                CRITICAL: The `data` prop IS the contentJson object.
                  Do NOT use `data.contentJson`.
                  Access fields directly (e.g., data.brand, data.navItems).
                  If you create an alias, it must be `const c = data;` (never data.contentJson).
                
                4. Component format (STRICT)
                - Each reactSource MUST be plain JSX (NO TypeScript types).
                - NEVER use React.createElement() - ALWAYS use JSX syntax like <div>, <section>, etc.
                - Each reactSource MUST declare the component exactly as:
                  export default function <PascalCaseSectionKey>Section({ data }) { ... }
                - The function name MUST be PascalCase + "Section" (e.g., sectionKey "work" → function "WorkSection").
                - The sectionKey itself should be lowercase (e.g., "work", "projects", "intro").
                - The function MUST be the default export.
                - Arrow functions are NOT allowed.
                - Assume React is in scope (NO import statements).
                - Do NOT include backticks or code fences.
                - Code MUST be properly formatted with newlines and indentation (NOT all on one line).
                
                5. Data rules
                - All dynamic content MUST come from `contentJson`.
                - If additional data is needed, define it inside `contentJson`.
                - Do NOT fetch data or invent runtime dependencies.
                - Uploaded media assets MUST be selectively embedded into contentJson and not duplicated or dumped wholesale
                
                6. Subcomponents
                - You MAY create internal subcomponents within a section file.
                - Subcomponents MAY accept any props they need.
                - Subcomponents MUST NOT be exported or reused outside the section.
                - The section’s public props contract MUST remain unchanged.
                
                7. Creativity (ONE-SHOT ONLY)
                - You MUST make intentional visual and structural design decisions.
                - Default or generic layouts are NOT acceptable.
                - Each section should feel designed, not templated.
                - You MUST add animations, transitions, and visual effects using framer motion.
                - You MAY introduce internal structure to improve layout and polish.
                - Creativity MUST remain scoped to the section only.
                
                8. Styling
                - Use Tailwind CSS utility classes for styling.
                - Do NOT write raw CSS, style tags, or external stylesheets.
                - Assume Tailwind is available and configured.
                
                9. Code quality & safety
                - Output MUST be valid JSON.
                - reactSource MUST be a valid JSON string with correct escaping.
                - Each section’s code must compile in isolation.
                - Do NOT mutate input data.
                - Do NOT introduce side effects outside rendering.
                - Prefer clear, stable implementations over clever ones.
                - reactSource MUST NOT reference any media URLs that are not present in contentJson
                
                ========================
                MEDIA USAGE RULES
                ========================
                
                - The user may provide uploaded media assets as structured input
                - Each asset includes metadata such as:
                  id, type, url, label, title, description, alt, sectionHint
                
                - You MAY include images and videos provided by the user
                - Media MUST be referenced by URL only
                - You MUST NOT invent, modify, guess, or hallucinate media URLs
                - You MUST NOT create new media assets
                - You MUST NOT transform media into base64, data URLs, blobs, or inline SVGs
                
                - All media references MUST live inside contentJson
                - reactSource MUST render media using standard HTML elements only:
                  - <img> for images
                  - <video> for videos
                
                - <video> elements:
                  - MUST include controls
                  - MUST NOT autoplay
                  - MUST NOT loop unless clearly justified by the design
                
                - Media usage MUST be intentional and support the portfolio narrative
                - If an asset includes sectionHint, treat it as a soft suggestion only
                
                ========================
                ANIMATION LIBRARY
                ========================

                - Framer Motion is AVAILABLE and REQUIRED
                - You MUST use Framer Motion for animations and transitions
                - Assume `motion` is available in scope
                - Do NOT import framer-motion explicitly
                - Animations MUST remain scoped to the section
                - Animations MUST serve a purpose such as:
                  - Establishing visual hierarchy
                  - Drawing attention to key content
                  - Guiding reading order
                - Avoid animating everything equally.
                - Prefer staggered entrance and emphasis animations
                  over uniform fade-ins.
                
                ========================
                REQUIRED INTERACTIONS
                ========================
                
                You MUST include BOTH:
                - On-view animations: elements animate when they enter the viewport.
                - Hover animations: interactive elements (cards, buttons, links) animate on hover.
                
                These animations should be prominent and noticeable, not subtle.
                Use Framer Motion only, and keep them scoped to the section.
                You MAY add additional animations using available dependencies when useful.
                
                
                ========================
                DESIGN INTENT (CRITICAL)
                ========================
                
                This portfolio is NOT a resume rendering.
                
                You MUST treat the resume as raw source material only.
                
                Your goal is to design a PERSONAL BRAND WEBSITE that:
                - Communicates personality, interests, and strengths
                - Makes intentional design choices
                - Feels crafted, not auto-generated
                - Prioritizes storytelling over completeness
                
                You MUST:
                - Choose an overall visual and narrative theme
                - Make deliberate layout and hierarchy decisions
                - Emphasize strengths over listing everything
                - Omit or downplay low-impact resume details when appropriate
                
                ========================
                PORTFOLIO THEME
                ========================

                You MUST internally decide on a unifying portfolio theme such as:
                - Minimal / editorial
                - Bold / experimental
                - Clean / professional
                - Playful / creative
                - Technical / futuristic
                - Warm / human-centered

                This theme MUST influence:
                - Typography scale and spacing
                - Color usage and contrast
                - Animation style and intensity
                - Section layout density

                The theme does NOT need to be stated explicitly,
                but it MUST be reflected consistently across sections.

                ========================
                GLOBAL THEME (REQUIRED)
                ========================

                You MUST output a `globalTheme` object alongside `sections`.

                The globalTheme provides unified background and text styling
                that wraps all sections at the page level.

                globalTheme structure:
                {
                    "background": "<Tailwind background classes for full-page wrapper>",
                    "textPrimary": "<Tailwind text color class>",
                    "textSecondary": "<Tailwind text color class>",
                    "accentColor": "<color name like 'purple', 'blue', 'emerald'>"
                }

                Example globalTheme:
                {
                    "background": "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900",
                    "textPrimary": "text-white",
                    "textSecondary": "text-slate-400",
                    "accentColor": "purple"
                }

                CRITICAL SECTION STYLING RULES:
                - Sections MUST have transparent or semi-transparent backgrounds ONLY
                - Allowed backgrounds: bg-transparent, bg-black/10, bg-white/5, bg-slate-900/50
                - NOT allowed: bg-slate-900, bg-white, bg-gradient-*, any fully opaque colors
                - The globalTheme provides the page background; sections provide content only
                - This ensures visual continuity when individual sections are regenerated

                ========================
                ICONS (REQUIRED WHERE APPROPRIATE)
                ========================
                Lucide React icons are AVAILABLE and should be used to enhance visual polish.
                Assume these icons are in scope (NO import statements needed):
                  Mail, Phone, MapPin, Globe, Github, Linkedin, ArrowUpRight

                You MUST use icons in these scenarios:
                - Contact section: Use Mail for email, Phone for phone, MapPin for location
                - Social links: Use Github, Linkedin, Globe for respective links
                - External links: Use ArrowUpRight for "view project" or outbound links

                Icons add visual clarity and professionalism. Do NOT omit them from
                contact info, social links, or call-to-action buttons.
                
                ========================
                REQUIRED SECTIONS
                ========================
                
                The generated portfolio MUST include the following sections:
                
                1. A Navbar section
                - sectionKey MUST be "navbar"
                - Must be given orderIndex: 0
                - Represents a top navigation bar

                - The Navbar is ALLOWED a limited exception to section isolation:
                  - It MAY scroll to other sections using anchor links or element IDs
                  - It MUST NOT read data from other sections
                  - It MUST NOT assume implementation details of other sections
                  - It MUST rely ONLY on IDs or anchors provided via its own contentJson

                - The Navbar MUST define its navigation items inside contentJson
                - Each nav item MUST include:
                  - label (string)
                  - targetId (string)

                - The Navbar MUST render links that scroll smoothly to matching section IDs
                
                2. A Footer section
                   - sectionKey MUST be "footer"
                   - Represents a page footer
                   - Must be given orderIndex: last
                   - May include copyright text, social links, or contact info
                   - MUST be self-contained

                3. A Contact section WHEN contact info exists
                   - If any contact info is present (email, phone, or location),
                     you MUST include a dedicated "Contact Me" section.
                   - sectionKey MUST be "contact"
                   - The title should be "Contact Me" or "Get in Touch"
                   - Place it near the end, before the Footer if possible
                   - The section MUST be self-contained and use only contact info provided
                   - Include the available contact fields (email/phone/location) in contentJson
                
                These sections are treated the same as all other sections and must
                fully follow all section isolation, React contract, and styling rules.
                
                ========================
                SECTION STRATEGY
                ========================

                You MUST include ALL resume sections provided in the input.
                Each resume section MUST be represented as either:
                - A dedicated portfolio section, OR
                - A clearly labeled combined section that explicitly includes that resume content.

                You MUST NOT simply mirror standard resume sections.
                
                At least TWO sections MUST:
                - Combine multiple resume concepts into one narrative section, OR
                - Reframe content using a non-resume label (e.g. "Journey", "Focus", "Impact", "Selected Work")
                
                Avoid generic section titles like:
                - Skills
                - Experience
                - Education
                
                Prefer expressive, intent-driven section names.
                
                ========================
                ASSISTANT MESSAGE (REQUIRED)
                ========================
                
                You MUST include an `assistantMessage` field in the output.
                
                This field is REQUIRED and its absence makes the output INVALID.

                The assistantMessage MUST:
                - Be human-readable and conversational
                - Summarize what sections were created
                - Explain high-level design or layout choices
                - Provide 2–4 concrete suggestions for next improvements
                - MUST explain the chosen design theme and how it
                influenced the portfolio

                Rules for assistantMessage:
                - Do NOT include code
                - Do NOT include JSON
                - Do NOT include markdown
                - Use plain text only
                
                ========================
                OUTPUT FORMAT (EXACT)
                ========================

                {
                  "globalTheme": {
                    "background": "<Tailwind classes>",
                    "textPrimary": "<Tailwind text class>",
                    "textSecondary": "<Tailwind text class>",
                    "accentColor": "<color name>"
                  },
                  "sections": [
                    {
                      "sectionKey": "<string>",
                      "title": "<string>",
                      "orderIndex": <number>,
                      "contentJson": { },
                      "reactSource": "<escaped JSX React component source>"
                    }
                  ],
                  "assistantMessage": {
                     "summary": "<string>",
                     "suggestions": ["<string>"]
                  }
                }

                IMPORTANT: The globalTheme field is REQUIRED and must be present.

                If a requested feature would normally require page-level coordination
                or additional props, implement a simpler version that respects these rules.
                
                """);

        UserMessage user = new UserMessage("""
                Generate an initial portfolio using the rules provided in the system prompt.

                Use the information below to decide:
                    - which sections to include
                    - what content belongs in each section’s contentJson
                    - how to design each section visually and structurally
                User prompt: %s
                Template ID: %s
                Style preferences: %s

                Resume data (use as source material only):
                Name: %s
                Summary: %s
                Contact info: %s
                Skills:%s
                Experience: %s
                Projects: %s
                Education: %s
                
                Uploaded media asets (URL + metadata only, optional to use):
                %s
        """. formatted(
                refinedPrompt,
                req.getTemplateId(),
                stylePrefs,
                safe(resume.getFullName()),
                safe(resume.getSummary()),
                formatContactInfo(resume),
                formatList(resume.getSkills()),
                resume.getExperiences() == null ? "none" : resume.getExperiences().toString(),
                resume.getProjects() == null ? "none" : resume.getProjects().toString(),
                resume.getEducations() == null ? "none" : resume.getEducations().toString(),
                assetsJson
        ));

        return new Prompt(List.of(system, user));
    }


    private String formatStylePrefs(Map<String, String> stylePrefs) {
        return stylePrefs == null || stylePrefs.isEmpty() ? "none" : stylePrefs.toString();
    }

    private String formatList(List<String> list) {
        return list == null || list.isEmpty() ? "none" : String.join(", ", list);
    }

    private String safe(String text) {
        return text == null ? "none" : text;
    }

    private String formatContactInfo(ParsedResumeDTO resume) {
        if (resume == null)
            return "none";

        boolean hasEmail = resume.getEmail() != null && !resume.getEmail().isBlank();
        boolean hasPhone = resume.getPhone() != null && !resume.getPhone().isBlank();
        boolean hasLocation = resume.getLocation() != null && !resume.getLocation().isBlank();

        if (!hasEmail && !hasPhone && !hasLocation)
            return "none";

        StringBuilder info = new StringBuilder();
        if (hasEmail)
            info.append("email=").append(resume.getEmail());
        if (hasPhone) {
            if (!info.isEmpty())
                info.append(", ");
            info.append("phone=").append(resume.getPhone());
        }
        if (hasLocation) {
            if (!info.isEmpty())
                info.append(", ");
            info.append("location=").append(resume.getLocation());
        }
        return info.toString();
    }

    private String serializeAssets(List<AssetDTO> assets) {
        if (assets == null || assets.isEmpty())
            return "[]";

        try {
            return objectMapper.writeValueAsString(assets);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize assets for prompt", e);
        }
    }

    public Prompt buildOneShotRetryPrompt(
            PortfolioGenerateRequestDTO req,
            String refinedPrompt,
            String previousResponse,
            List<ValidationResult.ValidationError> errors
    ) {
        ParsedResumeDTO resume = req.getResume();
        String stylePrefs = formatStylePrefs(req.getStylePrefs());
        String assetsJson = serializeAssets(req.getAssets());

        String errorSummary = errors.stream()
                .map(e -> String.format("- Section '%s': %s (line %s, col %s)",
                        e.getSectionKey(),
                        e.getMessage(),
                        e.getLine() != null ? e.getLine() : "?",
                        e.getColumn() != null ? e.getColumn() : "?"))
                .collect(Collectors.joining("\n"));

        SystemMessage system = new SystemMessage("""
                You are an AI software engineer working inside the PortfolioAI system.

                Your previous attempt to generate a portfolio had JSX validation errors.
                You MUST fix these errors while preserving the overall design intent.

                Focus ONLY on fixing the specific errors listed below.
                Do NOT make unnecessary changes to working sections.

                You must output JSON ONLY, following the exact schema below.
                Do NOT include markdown, explanations, comments, backticks, or extra text
                outside of the defined JSON fields.

                ========================
                VALIDATION ERRORS TO FIX
                ========================

                %s

                ========================
                COMMON JSX ERRORS TO AVOID
                ========================

                1. Syntax errors:
                   - Missing closing tags
                   - Unclosed JSX expressions
                   - Invalid attribute names (use camelCase: className, onClick)

                2. Expression errors:
                   - Unclosed curly braces in JSX
                   - Invalid JavaScript inside JSX expressions

                3. Component errors:
                   - Missing default export
                   - Invalid function declaration
                   - Using TypeScript syntax (remove type annotations)

                4. Data access errors:
                   - Using data?.field (don't use optional chaining)
                   - Using data.contentJson (access data directly)

                ========================
                ARCHITECTURAL RULES
                ========================

                All previous rules still apply:
                - Section-level artifacts only
                - Self-contained sections
                - React contract: data prop always present, no optional chaining
                - Plain JSX, no TypeScript
                - Tailwind CSS only
                - Framer Motion for animations
                - Lucide icons in scope (Mail, Phone, MapPin, Globe, Github, Linkedin, ArrowUpRight)

                ========================
                OUTPUT FORMAT (EXACT)
                ========================

                {
                  "globalTheme": {
                    "background": "<Tailwind classes>",
                    "textPrimary": "<Tailwind text class>",
                    "textSecondary": "<Tailwind text class>",
                    "accentColor": "<color name>"
                  },
                  "sections": [
                    {
                      "sectionKey": "<string>",
                      "title": "<string>",
                      "orderIndex": <number>,
                      "contentJson": { },
                      "reactSource": "<escaped JSX React component source>"
                    }
                  ],
                  "assistantMessage": {
                     "summary": "<string>",
                     "suggestions": ["<string>"]
                  }
                }
                """.formatted(errorSummary));

        UserMessage user = new UserMessage("""
                Fix the JSX validation errors in your previous response.

                PREVIOUS RESPONSE (with errors):
                %s

                ORIGINAL REQUEST:
                User prompt: %s
                Template ID: %s
                Style preferences: %s

                Resume data:
                Name: %s
                Summary: %s
                Contact info: %s
                Skills: %s
                Experience: %s
                Projects: %s
                Education: %s

                Uploaded media assets:
                %s

                Generate a corrected response with valid JSX for all sections.
        """.formatted(
                previousResponse,
                refinedPrompt,
                req.getTemplateId(),
                stylePrefs,
                safe(resume.getFullName()),
                safe(resume.getSummary()),
                formatContactInfo(resume),
                formatList(resume.getSkills()),
                resume.getExperiences() == null ? "none" : resume.getExperiences().toString(),
                resume.getProjects() == null ? "none" : resume.getProjects().toString(),
                resume.getEducations() == null ? "none" : resume.getEducations().toString(),
                assetsJson
        ));

        return new Prompt(List.of(system, user));
    }
}
