package com.webgen.webgen_backend.portfolio_service.prompt;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.dto.portfolio.common.AssetDTO;
import com.webgen.webgen_backend.dto.portfolio.builder.ValidationResult;
import com.webgen.webgen_backend.dto.portfolio.planner.SectionContentDTO;
import com.webgen.webgen_backend.dto.portfolio.planner.SectionPlanDTO;
import com.webgen.webgen_backend.model.portfolio.clarifier.ClarifierContext;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BuilderPromptBuilder {
    private final ObjectMapper objectMapper;

    /**
     * Build a prompt for refining a SINGLE section.
     * Scoped to one section to enable parallel worker execution.
     *
     * @param context          Clarifier constraints (intensity, preserveContent, etc.)
     * @param existingSection  Current section content (null for "add" actions)
     * @param plan             The planner's instruction for this specific section
     * @param assets           Available media assets
     */
    public Prompt buildSingleSectionPrompt(
            ClarifierContext context,
            SectionContentDTO existingSection,
            SectionPlanDTO plan,
            List<AssetDTO> assets
    ) {
        String contextJson = safeJson(context);
        String existingJson = existingSection != null
                ? safeJson(existingSection)
                : "null (this is a new section — create from scratch)";
        String planJson = safeJson(plan);
        String assetsJson = safeJson(assets);

        SystemMessage system = new SystemMessage("""
              You are a portfolio builder inside the PortfolioAI system.

              You are modifying a SINGLE portfolio section based on a modification plan.

              ========================
              INPUTS YOU WILL RECEIVE

              1. ClarifierContext — constraints and intent from the user's chat
              2. The EXISTING section (reactSource + contentJson) — or null if this is a new section
              3. A SectionPlan — the specific instruction for what to change
              4. Available assets (images/videos uploaded by user)

              ========================
              YOUR TASK

              Based on the plan's action:
              - "modify": Apply the instruction to the existing section. Respect preserveElements.
              - "add": Create a brand new section from scratch using the instruction.

              ========================
              CONSTRAINTS TO RESPECT

              - changeIntensity: LIGHT (minimal changes), MEDIUM (reframe), STRONG (rewrite)
              - preserveElements: list of elements that MUST remain unchanged when modifying
              - preserveContent: if true, only enhance — don't remove content
              - avoidCasualTone: if true, maintain professional language
              - reduceTextDensity: if true, keep content concise

              ========================
              MEDIA USAGE RULES (CRITICAL)
              ========================

              - You MAY include images and videos from the assets list
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
              - reactSource MUST NOT reference any media URLs that are not present in contentJson

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

              Icons add visual clarity and professionalism. Do NOT omit them.

              ========================
              OUTPUT FORMAT (STRICT)

              Return a single JSON object for this ONE section:
              {
                  "sectionKey": "<string>",
                  "title": "<string>",
                  "orderIndex": <number>,
                  "reactSource": "<full React/JSX code for the section>",
                  "contentJson": <object with section data>,
                  "changeDescription": "<1-2 sentence summary of what was changed and why>"
              }

              IMPORTANT:
              - Section backgrounds MUST be transparent (bg-transparent, bg-black/10, bg-white/5)
              - reactSource must be valid React/JSX code
              - Use React DOM attribute names only (className, htmlFor, tabIndex, readOnly, onClick, onMouseEnter, etc.)
              - Never use raw HTML aliases that trigger React warnings (class, for, tabindex, readonly, onclick, onmouseover, etc.)
              - Preserve Tailwind CSS classes and Framer Motion
              - `motion` is already declared in scope — do NOT re-declare, re-assign, or create
                fallbacks for it (no `var motion = ...`, no `typeof motion` checks)
              - reactSource MUST NOT contain any code comments (no // or /* */ comments)
              - Return JSON ONLY. No markdown, no explanations.
              """);

        UserMessage user = new UserMessage("""
              CLARIFIER CONTEXT (constraints):
              %s

              EXISTING SECTION:
              %s

              SECTION PLAN:
              %s

              AVAILABLE ASSETS (images/videos - use URLs from here only):
              %s

              TASK: Execute the plan for this single section. Return JSON only.
              """.formatted(contextJson, existingJson, planJson, assetsJson));

        return new Prompt(List.of(system, user));
    }


    /**
     * Minimal repair prompt — only sends the failed section and errors.
     * No clarifier context, plan, or assets (saves tokens).
     */
    public Prompt buildSingleSectionRetryPrompt(
            ClarifierContext context,
            SectionContentDTO existingSection,
            SectionPlanDTO plan,
            List<AssetDTO> assets,
            List<ValidationResult.ValidationError> errors
    ) {
        String failedSectionJson = existingSection != null
                ? safeJson(existingSection)
                : "null";
        String errorsJson = safeJson(errors);

        SystemMessage system = new SystemMessage("""
              You are fixing JSX validation errors in a React portfolio section.

              This is a REPAIR task. Fix ONLY the listed errors. Do NOT redesign,
              simplify, or remove any working code.

              RULES:
              - Preserve all layout, styling, animations, and contentJson as-is
              - Plain JSX only — no TypeScript, no import statements
              - Component format: export default function <Name>Section({ data }) { ... }
              - `data` prop is always present — no optional chaining
              - `motion` is already in scope — do NOT re-declare it
                (no `var motion = ...`, no `typeof motion` checks)
              - Use React DOM attribute names only (className, htmlFor, tabIndex, readOnly, camelCase events)
              - Never use raw HTML aliases (class, for, tabindex, readonly, onclick, onmouseover, etc.)
              - Lucide icons in scope: Mail, Phone, MapPin, Globe, Github, Linkedin, ArrowUpRight
              - No code comments (no // or /* */)
              - Tailwind CSS only, transparent/semi-transparent backgrounds only

              OUTPUT FORMAT:
              {
                  "sectionKey": "<string>",
                  "title": "<string>",
                  "orderIndex": <number>,
                  "reactSource": "<full React/JSX code>",
                  "contentJson": <object>,
                  "changeDescription": "<1-2 sentence summary>"
              }

              Return JSON ONLY.
              """);

        UserMessage user = new UserMessage("""
              Fix the errors in this section and return the corrected JSON.

              FAILED SECTION:
              %s

              VALIDATION ERRORS:
              %s
              """.formatted(failedSectionJson, errorsJson));

        return new Prompt(List.of(system, user));
    }

    private String safeJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }


}
