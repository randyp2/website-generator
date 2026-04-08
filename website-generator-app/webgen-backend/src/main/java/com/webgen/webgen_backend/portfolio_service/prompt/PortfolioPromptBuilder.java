package com.webgen.webgen_backend.portfolio_service.prompt;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.dto.portfolio.*;
import com.webgen.webgen_backend.dto.portfolio.common.*;
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
        String customNotes = extractCustomNotes(req.getStylePrefs());
        String effectivePrompt = applyCustomNotes(refinedPrompt, customNotes);

        String assetsJson = serializeAssets(req.getAssets());

        // --- Construct system and user message
        SystemMessage system = new SystemMessage(
                """
                        You are an AI software engineer working inside the PortfolioAI system.

                        Your task is to generate an INITIAL, ONE-SHOT portfolio composed of
                        multiple independent sections.

                        You must output JSON ONLY, following the exact schema below.
                        Do NOT include markdown, explanations, backticks, or extra text
                        outside of the defined JSON fields.
                        reactSource MUST NOT contain any code comments (no // or /* */ comments).

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
                        - Use React DOM attribute names only (className, htmlFor, tabIndex, readOnly, onClick, onMouseEnter, etc.).
                        - NEVER use raw HTML attribute aliases that trigger React warnings (class, for, tabindex, readonly, onclick, onmouseover, etc.).
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
                        - CRITICAL: The main exported function MUST still destructure { data } in its parameter list and explicitly pass data to sub-components. Never reference `data` from a function that does not have it in its own parameter list.

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

                        ========================
                        TYPOGRAPHY (CRITICAL)
                        ========================

                        You MUST select fonts from the approved Google Fonts whitelist below.
                        Do NOT use system fonts, do NOT invent font names.

                        APPROVED FONTS:
                        - Sans-serif: Inter, Outfit, Space Grotesk, DM Sans, Plus Jakarta Sans
                        - Serif: Playfair Display, Lora, Source Serif 4, Merriweather
                        - Monospace: JetBrains Mono, Fira Code, IBM Plex Mono
                        - Display: Syne

                        You MUST include a "fonts" field in the globalTheme object:
                        {
                          "fonts": {
                            "heading": "<font name from whitelist>",
                            "body": "<font name from whitelist>"
                          }
                        }

                        In reactSource, apply fonts using inline style:
                          style={{ fontFamily: "'Playfair Display', serif" }}
                        Or Tailwind arbitrary values:
                          className="font-['Playfair_Display']"

                        The user's typography preference from style chat should guide your choice:
                        - "serif" → pick a serif font for body, optionally serif or display for headings
                        - "sans-serif" → pick a sans-serif font for both
                        - "monospace" → pick a monospace font for body, sans-serif for headings
                        - "mixed" → pick different categories for heading vs body

                        9. Code quality & safety
                        - Output MUST be valid JSON.
                        - reactSource MUST be a valid JSON string with correct escaping.
                        - Each section’s code must compile in isolation.
                        - Do NOT mutate input data.
                        - Do NOT introduce side effects outside rendering.
                        - Prefer clear, stable implementations over clever ones.
                        - reactSource MUST NOT reference any media URLs that are not present in contentJson

                        10. Custom style notes (CRITICAL)
                        - If custom style notes are provided, you MUST implement them.
                        - Treat them as hard requirements for the visual design.

                        11. Responsive design (REQUIRED)
                        - All sections MUST be responsive and render correctly across screen sizes.
                        - Use Tailwind responsive prefixes (sm:, md:, lg:) for layout shifts.
                        - Grids and multi-column layouts MUST stack on mobile.
                        - Typography and spacing should scale appropriately.
                        - Design mobile-first, then adapt for larger screens.

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
                        - `motion` is already declared in scope — use it directly (e.g. <motion.div>)
                        - Do NOT import framer-motion explicitly
                        - Do NOT re-declare, re-assign, or create fallbacks for `motion`
                          (no `var motion = ...`, no `const motion = ...`, no `typeof motion` checks)
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
                        - Scroll handler MUST use: document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })
                        - Do NOT use anchor tags with href="#id" for scrolling

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
                            "accentColor": "<color name>",
                            "fonts": {
                              "heading": "<font name from approved whitelist>",
                              "body": "<font name from approved whitelist>"
                            }
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
                        IMPORTANT: The fonts field inside globalTheme is REQUIRED.

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
                        Custom style notes (MUST implement): %s

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
                """.formatted(
                effectivePrompt,
                req.getTemplateId(),
                stylePrefs,
                customNotes.isBlank() ? "none" : customNotes,
                safe(resume.getFullName()),
                safe(resume.getSummary()),
                formatContactInfo(resume),
                formatList(resume.getSkills()),
                resume.getExperiences() == null ? "none" : resume.getExperiences().toString(),
                resume.getProjects() == null ? "none" : resume.getProjects().toString(),
                resume.getEducations() == null ? "none" : resume.getEducations().toString(),
                assetsJson));

        return new Prompt(List.of(system, user));
    }

    /**
     * Builds the planning prompt that plans the direction of this portfolio style &
     * content wise
     * No react code being generated
     * Locks in shared design idea so sections remain coherent
     * 
     * @param req - request holding metadata of user for more context
     * @param refinedPrompt - refined user prompt
     * @return return structured raw json for overall theme and plan of portfolio
     */
    public Prompt buildBlueprintPrompt(PortfolioGenerateRequestDTO req, String refinedPrompt) {
        ParsedResumeDTO resume = req.getResume();
        String stylePrefs = formatStylePrefs(req.getStylePrefs());
        String customNotes = extractCustomNotes(req.getStylePrefs());
        String effectivePrompt = applyCustomNotes(refinedPrompt, customNotes);
        String assetsJson = serializeAssets(req.getAssets());

        SystemMessage system = new SystemMessage("""
                You are an AI software engineer working inside the PortfolioAI system.

                Your task is to produce a BLUEPRINT for a portfolio website.
                You are NOT generating any React code in this step.

                The blueprint defines:
                1. The globalTheme (colors, fonts, accent, background)
                2. An ordered list of sections to generate (the section plan)
                3. A designDirective — a short paragraph describing the overall
                   visual and narrative direction that every section must follow

                ========================
                SECTION PLAN RULES
                ========================

                - You MUST include a "navbar" section with orderIndex 0
                - You MUST include a "footer" section with the highest orderIndex
                - If contact info exists, include a "contact" section near the end
                - You MUST include ALL resume sections — either as dedicated sections
                  or clearly combined into narrative sections
                - At least ONE section MUST reframe or combine resume content
                  (e.g. "Journey", "Selected Work", "Focus")
                - Additional sections SHOULD prefer expressive, intent-driven titles
                  but MAY use conventional titles when the content warrants it

                Each section plan item must include:
                - sectionKey: lowercase identifier
                - title: display title
                - orderIndex: integer render order
                - layoutHint: brief description of intended layout.
                  Be specific and varied — do NOT default to the same layout for
                  every section. Examples of diverse layouts:
                  "asymmetric two-column with oversized left heading",
                  "staggered masonry grid", "full-bleed hero with viewport split",
                  "horizontal scroll cards on desktop, stacked on mobile",
                  "timeline with alternating sides", "bento grid with one featured item"
                  Layout hints MUST be mobile-friendly — avoid layouts that cannot
                  gracefully stack or reflow on small screens.
                - contentStrategy: what resume data to include and what to emphasize

                ========================
                DESIGN DIRECTIVE (CRITICAL)
                ========================

                The designDirective is a detailed paragraph that captures:
                - The chosen visual theme (minimal, bold, editorial, etc.)
                - Animation style and intensity — specify WHICH sections get bold
                  animation vs. subtle or none
                - Spacing and density preferences
                - How sections should relate to each other visually
                - Responsive strategy (how layouts adapt from mobile to desktop)
                - Recurring visual motifs or signature design elements
                - At least ONE unconventional design choice that makes this
                  portfolio feel distinct (e.g. asymmetric grids, oversized
                  typography, layered depth effects, editorial whitespace,
                  accent-colored dividers, mixed layout rhythms)

                The designDirective MUST be specific and opinionated, NOT generic.

                BAD example (too vague):
                "A clean, modern portfolio with smooth animations and good spacing."

                GOOD example (specific, bold):
                "Editorial magazine aesthetic — dramatic scale contrast between
                section headings (8xl+) and body text, generous vertical whitespace
                between sections, accent-colored thin rules as dividers. Hero uses
                a full-viewport split layout with name on the left and a bold
                gradient shape on the right. Projects section uses an asymmetric
                masonry grid. Animations are cinematic: slow slide-ups (0.8s) for
                headings, staggered fade-ins for cards. Footer is minimal, single
                line. Mobile collapses grids to single column with preserved
                typographic hierarchy."

                This directive will be passed verbatim to each per-section prompt,
                so it must be specific enough to produce a coherent and visually
                distinctive portfolio. Generic directives produce generic results.

                ========================
                TYPOGRAPHY (CRITICAL)
                ========================

                APPROVED FONTS:
                - Sans-serif: Inter, Outfit, Space Grotesk, DM Sans, Plus Jakarta Sans
                - Serif: Playfair Display, Lora, Source Serif 4, Merriweather
                - Monospace: JetBrains Mono, Fira Code, IBM Plex Mono
                - Display: Syne

                The user's typography preference from style prefs should guide your choice.

                ========================
                GLOBAL THEME
                ========================

                globalTheme structure:
                {
                    "background": "<Tailwind background classes for full-page wrapper>",
                    "textPrimary": "<Tailwind text color class>",
                    "textSecondary": "<Tailwind text color class>",
                    "accentColor": "<color name>",
                    "fonts": {
                        "heading": "<font from approved list>",
                        "body": "<font from approved list>"
                    }
                }

                ========================
                OUTPUT FORMAT (EXACT)
                ========================

                {
                  "globalTheme": { ... },
                  "sectionPlan": [
                    {
                      "sectionKey": "<string>",
                      "title": "<string>",
                      "orderIndex": <number>,
                      "layoutHint": "<string>",
                      "contentStrategy": "<string>"
                    }
                  ],
                  "designDirective": "<string>",
                  "assistantMessage": {
                    "summary": "<string>",
                    "suggestions": ["<string>"]
                  }
                }

                Output JSON ONLY. No markdown, no backticks, no extra text.
                """);

        UserMessage user = new UserMessage("""
                        Create a portfolio blueprint using the rules in the system prompt.

                        User prompt: %s
                        Template ID: %s
                        Style preferences: %s
                        Custom style notes (MUST implement): %s

                        Resume data (use as source material only):
                        Name: %s
                        Summary: %s
                        Contact info: %s
                        Skills: %s
                        Experience: %s
                        Projects: %s
                        Education: %s

                        Uploaded media assets:
                        %s
                """.formatted(
                effectivePrompt,
                req.getTemplateId(),
                stylePrefs,
                customNotes.isBlank() ? "none" : customNotes,
                safe(resume.getFullName()),
                safe(resume.getSummary()),
                formatContactInfo(resume),
                formatList(resume.getSkills()),
                resume.getExperiences() == null ? "none" : resume.getExperiences().toString(),
                resume.getProjects() == null ? "none" : resume.getProjects().toString(),
                resume.getEducations() == null ? "none" : resume.getEducations().toString(),
                assetsJson));

        return new Prompt(List.of(system, user));

    }

    /**
     * Builds a prompt to generate one sections' React Code
     * Uses blueprint for context + list of descriptions of previously generated
     * sections
     *
     * @param req             original generation req w/ metadata (resume, assets,
     *                        etc.)
     * @param refinedPrompt   refined user prompt passed through LLM
     * @param blueprint       bluePrint have overall portfolio
     * @param targetSection   which section to generate
     * @return Prompt w/ system and user prompt
     */
    public Prompt buildSectionPrompt(
            PortfolioGenerateRequestDTO req,
            String refinedPrompt,
            BlueprintDTO blueprint,
            BlueprintSectionPlanDTO targetSection
    ) {

        ParsedResumeDTO resume = req.getResume();
        String customNotes = extractCustomNotes(req.getStylePrefs());
        String effectivePrompt = applyCustomNotes(refinedPrompt, customNotes);
        String assetsJson = serializeAssets(req.getAssets());

        // Serialize global theme as a json string
        String themeJson = "";
        try {
            themeJson = objectMapper.writeValueAsString(blueprint.getGlobalThemeDTO());
        } catch (JsonProcessingException e) {
            themeJson = "{}";
        }

        SystemMessage system = new SystemMessage("""
                You are an AI software engineer working inside the PortfolioAI system.

                You are generating a SINGLE portfolio section as part of a larger portfolio.
                A planning step has already decided the theme, section list, and design direction.
                You MUST follow the blueprint exactly.

                ========================
                DESIGN DIRECTIVE (FOLLOW THIS)
                ========================

                %s

                ========================
                GLOBAL THEME (USE THIS)
                ========================

                %s

                The globalTheme controls the page background.
                Sections SHOULD use transparent or semi-transparent backgrounds
                (e.g. bg-transparent, bg-black/10, bg-white/5, bg-slate-900/50).
                Subtle high-opacity backgrounds (e.g. bg-black/90, bg-slate-800/80) are
                ALLOWED when the design calls for contrast between sections.
                Fully opaque backgrounds that clash with the globalTheme are NOT allowed.

                ========================
                CREATIVITY GUIDANCE
                ========================

                The blueprint's layoutHint and designDirective define the creative
                direction. Interpret them boldly — push beyond the first obvious
                implementation.

                - Vary visual density: not every section needs the same rhythm
                - Use whitespace, scale contrast, and typography weight as design tools
                - Layouts should feel intentional — avoid defaulting to centered-stack
                  or uniform card-grid unless the blueprint specifically calls for it
                - Each section should have a distinct visual identity while staying
                  coherent with the globalTheme
                - Default or generic layouts are NOT acceptable
                - Each section should feel designed, not templated

                ========================
                ANIMATION GUIDANCE
                ========================

                Framer Motion is available in scope (no imports needed).
                `motion` is already declared — use it directly (e.g. <motion.div>).
                Do NOT re-declare, re-assign, or create fallbacks for `motion`
                (no `var motion = ...`, no `const motion = ...`, no `typeof motion` checks).

                - Hero/intro and content-heavy sections SHOULD use Framer Motion for
                  entrance animations and hover interactions
                - Supporting sections (footer, contact, navbar) MAY use simpler CSS
                  transitions or minimal animation — forced animation on every section
                  reduces impact
                - Vary animation intensity by section importance: bold for hero,
                  understated for supporting sections
                - Prefer staggered entrance and emphasis animations over uniform fade-ins
                - Animations should serve the design (hierarchy, attention, reading order),
                  not be applied uniformly

                ========================
                NAVBAR SMOOTH SCROLL (MANDATORY)
                ========================

                If this section is the navbar (sectionKey "navbar"):
                - Each nav link MUST scroll smoothly to the target section
                - Use this exact scroll handler pattern in the onClick:
                  document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })
                - Do NOT use anchor tags with href="#id" for scrolling
                - Do NOT use window.scrollTo or other scroll methods
                - The navbar MUST define navItems in contentJson, each with:
                  label (string) and targetId (string)

                ========================
                ARCHITECTURAL RULES (STRICT)
                ========================

                1. Generate exactly ONE section.
                2. Section must be fully self-contained and independently renderable.
                3. The section MUST render a top-level element with id equal to its sectionKey.
                4. React contract: single `data` prop, always present, no optional chaining.
                5. Component format: export default function <PascalCaseSectionKey>Section({ data }) { ... }. The default export MUST always have { data } in its parameter list, even if it delegates to sub-components.
                6. Plain JSX only — no TypeScript, no imports, no arrow function exports.
                7. All dynamic content from contentJson via the `data` prop.
                8. Tailwind CSS only for styling.
                9. Lucide icons in scope: Mail, Phone, MapPin, Globe, Github, Linkedin, ArrowUpRight.
                10. Apply fonts from globalTheme using inline style or Tailwind arbitrary values.
                11. Custom style notes are mandatory if provided.
                12. Media URLs must come from contentJson only — never invent URLs.
                13. No code comments — do NOT include // or /* */ comments in reactSource.
                14. Use React DOM attribute names only (className/htmlFor/tabIndex/readOnly/camelCase event handlers). Never use class/for/tabindex/readonly/onclick.

                ========================
                RESPONSIVE DESIGN (REQUIRED)
                ========================

                All sections MUST be responsive and render correctly across screen sizes.
                - Use Tailwind responsive prefixes (sm:, md:, lg:) for layout shifts
                - Grids and multi-column layouts MUST stack on mobile
                - Typography and spacing should scale appropriately
                - Design mobile-first, then adapt for larger screens

                ========================
                OUTPUT FORMAT (EXACT)
                ========================

                {
                  "sectionKey": "<string>",
                  "title": "<string>",
                  "orderIndex": <number>,
                  "contentJson": { ... },
                  "reactSource": "<escaped JSX source>"
                }

                Output JSON ONLY. No markdown, no backticks, no extra text.
                """.formatted(
                blueprint.getDesignDirective(),
                themeJson
                ));

        UserMessage user = new UserMessage("""
                        Generate the "%s" section (orderIndex: %d).

                        Section plan:
                        - Layout hint: %s
                        - Content strategy: %s

                        User prompt: %s
                        Custom style notes: %s

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
                """.formatted(
                targetSection.getSectionKey(),
                targetSection.getOrderIndex(),
                targetSection.getLayoutHint(),
                targetSection.getContentStrategy(),
                effectivePrompt,
                customNotes.isBlank() ? "none" : customNotes,
                safe(resume.getFullName()),
                safe(resume.getSummary()),
                formatContactInfo(resume),
                formatList(resume.getSkills()),
                resume.getExperiences() == null ? "none" : resume.getExperiences().toString(),
                resume.getProjects() == null ? "none" : resume.getProjects().toString(),
                resume.getEducations() == null ? "none" : resume.getEducations().toString(),
                assetsJson));

        return new Prompt(List.of(system, user));

    }

    private String formatStylePrefs(Map<String, String> stylePrefs) {
        if (stylePrefs == null || stylePrefs.isEmpty())
            return "none";
        return stylePrefs.entrySet()
                .stream()
                .map(e -> e.getKey() + ": " + (e.getValue() == null || e.getValue().isBlank() ? "none" : e.getValue()))
                .collect(Collectors.joining("; "));
    }

    // Extract the custom notes that are nested w/in styleprefs
    private String extractCustomNotes(Map<String, String> stylePrefs) {
        if (stylePrefs == null)
            return "";
        String notes = stylePrefs.get("customNotes");
        if (notes == null)
            return "";
        String trimmed = notes.trim();
        return trimmed.isBlank() ? "" : trimmed;
    }

    // Concat custom notes to prompt
    private String applyCustomNotes(String refinedPrompt, String customNotes) {
        if (customNotes == null || customNotes.isBlank())
            return refinedPrompt;
        return refinedPrompt + "\n\nCUSTOM STYLE NOTES (must implement): " + customNotes;
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

    /**
     * Retry prompt — sends errors, failed code, and the LOCKED contentJson.
     * The LLM must fix only the reactSource; sectionKey, title, orderIndex,
     * and contentJson are frozen from attempt 1.
     */
    public Prompt buildSectionRetryPrompt(
            PortfolioGenerateRequestDTO req,
            String refinedPrompt,
            BlueprintDTO blueprint,
            BlueprintSectionPlanDTO targetSection,
            List<ValidationResult.ValidationError> errors,
            String failedReactSource,
            com.fasterxml.jackson.databind.JsonNode lockedContentJson
    ) {
        String errorSummary = errors.stream()
                .map(e -> String.format("- %s (line %s, col %s)",
                        e.getMessage(),
                        e.getLine() != null ? e.getLine() : "?",
                        e.getColumn() != null ? e.getColumn() : "?"))
                .collect(Collectors.joining("\n"));

        // Serialize locked contentJson so the LLM knows which fields are available
        String contentJsonStr;
        try {
            contentJsonStr = lockedContentJson != null
                    ? objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(lockedContentJson)
                    : "{}";
        } catch (JsonProcessingException e) {
            contentJsonStr = "{}";
        }

        // Extract top-level field names for the constraint list
        String fieldList = "{}";
        if (lockedContentJson != null && lockedContentJson.isObject()) {
            StringBuilder sb = new StringBuilder();
            lockedContentJson.fieldNames().forEachRemaining(f -> {
                if (!sb.isEmpty()) sb.append(", ");
                sb.append(f);
            });
            fieldList = sb.toString();
        }

        SystemMessage system = new SystemMessage("""
                You are fixing JSX validation errors in a React portfolio section.

                This is a REPAIR task. You MUST fix ONLY the reactSource.
                Do NOT redesign, simplify, or remove any working code.

                ========================
                ERRORS TO FIX
                ========================

                %s

                ========================
                LOCKED FIELDS (DO NOT CHANGE)
                ========================

                The following values are FROZEN from the first attempt.
                You MUST return them EXACTLY as shown — do NOT modify, rename,
                or restructure them:

                sectionKey: "%s"
                title: "%s"
                orderIndex: %d

                contentJson (FROZEN — return verbatim):
                %s

                ========================
                DATA CONTRACT (CRITICAL)
                ========================

                Your reactSource receives `data` which IS the contentJson above.
                You may ONLY access these top-level fields on `data`:
                %s

                If your code accesses a field not in this list, it WILL crash.
                Do NOT invent new fields. Do NOT restructure contentJson.
                Do NOT use optional chaining (data?.field) — all listed fields
                are guaranteed present.

                ========================
                RULES
                ========================

                - Plain JSX only — no TypeScript, no import statements
                - Component format: export default function %sSection({ data }) { ... }
                - `data` prop is always present — no optional chaining
                - `motion` is already in scope — do NOT re-declare it
                  (no `var motion = ...`, no `typeof motion` checks)
                - Use React DOM attribute names only (className, htmlFor, tabIndex, readOnly, camelCase events)
                - Never use raw HTML aliases (class, for, tabindex, readonly, onclick, onmouseover, etc.)
                - Lucide icons in scope: Mail, Phone, MapPin, Globe, Github, Linkedin, ArrowUpRight
                - No code comments (no // or /* */)
                - Tailwind CSS only, transparent/semi-transparent backgrounds only
                - Code MUST be properly formatted with newlines and indentation

                ========================
                OUTPUT FORMAT
                ========================

                {
                  "sectionKey": "%s",
                  "title": "%s",
                  "orderIndex": %d,
                  "contentJson": <RETURN THE EXACT SAME contentJson above>,
                  "reactSource": "<fixed JSX source>"
                }

                Return JSON ONLY. The ONLY field you should change is reactSource.
                """.formatted(
                errorSummary,
                targetSection.getSectionKey(),
                targetSection.getTitle(),
                targetSection.getOrderIndex(),
                contentJsonStr,
                fieldList,
                toPascalCase(targetSection.getSectionKey()),
                targetSection.getSectionKey(),
                targetSection.getTitle(),
                targetSection.getOrderIndex()
        ));

        UserMessage user = new UserMessage("""
                Fix the errors in the reactSource below and return the corrected JSON.

                FAILED reactSource:
                %s
                """.formatted(
                failedReactSource != null ? failedReactSource : "(no previous code available)"
        ));

        return new Prompt(List.of(system, user));
    }

    private String toPascalCase(String sectionKey) {
        if (sectionKey == null || sectionKey.isBlank()) return "Unknown";
        StringBuilder sb = new StringBuilder();
        for (String part : sectionKey.split("-")) {
            if (!part.isEmpty()) {
                sb.append(Character.toUpperCase(part.charAt(0)));
                if (part.length() > 1) sb.append(part.substring(1));
            }
        }
        return sb.toString();
    }
}
