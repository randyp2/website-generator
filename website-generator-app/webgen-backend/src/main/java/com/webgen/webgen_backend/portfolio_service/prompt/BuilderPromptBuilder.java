package com.webgen.webgen_backend.portfolio_service.prompt;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.dto.portfolio.AssetDTO;
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
              - Preserve Tailwind CSS classes and Framer Motion
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
     * Error-aware retry prompt for a single refined section.
     * Includes validation errors from the previous attempt so the LLM
     * can fix specific JSX issues instead of generating blindly.
     */
    public Prompt buildSingleSectionRetryPrompt(
            ClarifierContext context,
            SectionContentDTO existingSection,
            SectionPlanDTO plan,
            List<AssetDTO> assets,
            List<ValidationResult.ValidationError> errors
    ) {
        String contextJson = safeJson(context);
        String existingJson = existingSection != null
                ? safeJson(existingSection)
                : "null (this is a new section — create from scratch)";
        String planJson = safeJson(plan);
        String assetsJson = safeJson(assets);
        String errorsJson = safeJson(errors);

        SystemMessage system = new SystemMessage("""
              You are a portfolio builder inside the PortfolioAI system.

              IMPORTANT: Your previous attempt to generate this section had JSX validation errors.
              You MUST fix the errors listed below and return valid React/JSX code.

              You are modifying a SINGLE portfolio section based on a modification plan.

              ========================
              VALIDATION ERRORS TO FIX
              ========================

              The errors are listed in the user message below. Fix ALL of them.

              ========================
              COMMON JSX ERRORS TO AVOID
              ========================

              1. Syntax: Missing closing tags, unclosed JSX expressions, use camelCase attributes
              2. Expressions: Unclosed curly braces, invalid JS inside JSX
              3. Component: Missing default export, invalid function declaration, no TypeScript
              4. Data access: No optional chaining (data?.field), access data directly (not data.contentJson)

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
              - All media references MUST live inside contentJson
              - reactSource MUST render media using <img> or <video> only
              - <video> elements MUST include controls, MUST NOT autoplay

              ========================
              ICONS (REQUIRED WHERE APPROPRIATE)
              ========================
              Lucide React icons are available (NO import needed):
                Mail, Phone, MapPin, Globe, Github, Linkedin, ArrowUpRight

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
              - Preserve Tailwind CSS classes and Framer Motion
              - Return JSON ONLY. No markdown, no explanations.
              - Fix ALL errors and ensure the code compiles correctly.
              """);

        UserMessage user = new UserMessage("""
              CLARIFIER CONTEXT (constraints):
              %s

              EXISTING SECTION:
              %s

              SECTION PLAN:
              %s

              AVAILABLE ASSETS:
              %s

              VALIDATION ERRORS FROM PREVIOUS ATTEMPT:
              %s

              TASK: Fix the errors above and regenerate this section. Return JSON only.
              """.formatted(contextJson, existingJson, planJson, assetsJson, errorsJson));

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
