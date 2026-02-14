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

    public Prompt buildPrompt(
            ClarifierContext context,
            List<SectionContentDTO> sections,
            List<SectionPlanDTO> sectionPlans,
            List<AssetDTO> assets
    ) {
        String contextJson = safeJson(context);
        String sectionsJson = safeJson(sections);
        String plansJson = safeJson(sectionPlans);
        String assetsJson = safeJson(assets);

        SystemMessage system = new SystemMessage("""
                You are a portfolio builder inside the PortfolioAI system.

                Your role is to execute modification plans and generate refined portfolio sections.
                You receive the original sections, a modification plan, constraints, and available assets.

                ========================
                INPUTS YOU WILL RECEIVE

                1. ClarifierContext - contains constraints and intent
                2. Current portfolio sections with full React source
                3. Section plans with instructions for each section
                4. Available assets (images/videos uploaded by user)

                ========================
                YOUR RESPONSIBILITIES

                For each section plan:
                - If action = "keep": return section unchanged
                - If action = "modify": apply the instruction and generate new React source
                - If action = "add": create a NEW section using the provided sectionKey and instruction
                - If action = "reorder": note the new order (handled by frontend)
                - If action = "delete": omit that section from modifiedSections and include its key in deletedSectionKeys
                - If action = "delete": omit that section from modifiedSections and include its key in deletedSectionKeys

                ========================
                CONSTRAINTS TO RESPECT

                - lockedSectionKeys: DO NOT modify these sections
                - preserveContent: if true, only enhance, don't remove content
                - changeIntensity: LIGHT (minimal changes), MEDIUM (reframe), STRONG (rewrite)
                - avoidCasualTone: if true, maintain professional language
                - reduceTextDensity: if true, keep content concise

                ========================
                MEDIA USAGE RULES (CRITICAL)
                ========================

                - The user may have uploaded media assets as structured input
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
                - reactSource MUST NOT reference any media URLs that are not present in contentJson

                ========================
                GLOBAL THEME HANDLING
                ========================

                If user requests a theme/background change:
                - Output an updated `globalTheme` object in the response
                - Do NOT add backgrounds to individual sections

                If user requests section change ONLY:
                - Do NOT output globalTheme (omit the field entirely)
                - Keep section backgrounds transparent (bg-transparent, bg-black/10, bg-white/5)

                CRITICAL: Never add opaque backgrounds to sections.
                Sections MUST remain transparent to allow the global theme to show through.

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

                Return a single JSON object:
                {
                    "buildSummary": "<1-2 sentence summary of changes made>",
                    "globalTheme": {  // OPTIONAL: only include if theme was changed
                        "background": "<Tailwind classes>",
                        "textPrimary": "<Tailwind text class>",
                        "textSecondary": "<Tailwind text class>",
                        "accentColor": "<color name>"
                    },
                    "modifiedSections": [
                        {
                            "sectionKey": "<string>",
                            "title": "<string>",
                            "orderIndex": <number>,
                            "reactSource": "<full React/JSX code for the section>",
                            "contentJson": <object with section data>,
                            "changeDescription": "<what was changed in this section>"
                        }
                    ],
                    "deletedSectionKeys": ["<sectionKey>", "..."] // OPTIONAL
                }

                IMPORTANT:
                - reactSource must be valid React/JSX code
                - Include ALL sections (modified, unchanged, and newly added), except those deleted
                - Preserve Tailwind CSS classes and Framer Motion
                - Return JSON ONLY. No markdown, no explanations.
                - Only include globalTheme if the user explicitly requested a theme/background change
                """);

        UserMessage user = new UserMessage("""
                CLARIFIER CONTEXT (constraints):
                %s

                CURRENT SECTIONS:
                %s

                SECTION PLANS:
                %s

                AVAILABLE ASSETS (images/videos - use URLs from here only):
                %s

                TASK:
                - Execute each plan instruction
                - Generate modified React source for "modify" actions
                - Create new sections for "add" actions
                - Return unchanged sections for "keep" actions
                - For "delete" actions, omit the section and add its key to deletedSectionKeys
                - When adding media, use ONLY URLs from the AVAILABLE ASSETS list
                - Add media URLs to contentJson, then reference them in reactSource
                - Return JSON only
                """.formatted(contextJson, sectionsJson, plansJson, assetsJson));

        return new Prompt(List.of(system, user));
    }

    public Prompt buildRetryPrompt(
            ClarifierContext context,
            List<SectionContentDTO> sections,
            List<SectionPlanDTO> sectionPlans,
            List<AssetDTO> assets,
            List<ValidationResult.ValidationError> errors
    ) {
        String contextJson = safeJson(context);
        String sectionsJson = safeJson(sections);
        String plansJson = safeJson(sectionPlans);
        String assetsJson = safeJson(assets);
        String errorsJson = safeJson(errors);

        SystemMessage system = new SystemMessage("""
                You are a portfolio builder inside the PortfolioAI system.

                IMPORTANT: Your previous code generation attempt had syntax errors.
                You MUST fix the errors listed below and return valid React/JSX code.

                ========================
                INPUTS YOU WILL RECEIVE

                1. ClarifierContext - contains constraints and intent
                2. Current portfolio sections with full React source
                3. Section plans with instructions for each section
                4. Available assets (images/videos uploaded by user)
                5. VALIDATION ERRORS from your previous attempt

                ========================
                YOUR RESPONSIBILITIES

                For each section plan:
                - If action = "keep": return section unchanged
                - If action = "modify": apply the instruction and generate new React source
                - If action = "add": create a NEW section using the provided sectionKey and instruction
                - If action = "reorder": note the new order (handled by frontend)

                ========================
                CONSTRAINTS TO RESPECT

                - lockedSectionKeys: DO NOT modify these sections
                - preserveContent: if true, only enhance, don't remove content
                - changeIntensity: LIGHT (minimal changes), MEDIUM (reframe), STRONG (rewrite)
                - avoidCasualTone: if true, maintain professional language
                - reduceTextDensity: if true, keep content concise

                ========================
                MEDIA USAGE RULES (CRITICAL)
                ========================

                - The user may have uploaded media assets as structured input
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
                - reactSource MUST NOT reference any media URLs that are not present in contentJson

                ========================
                GLOBAL THEME HANDLING
                ========================

                If user requests a theme/background change:
                - Output an updated `globalTheme` object in the response
                - Do NOT add backgrounds to individual sections

                If user requests section change ONLY:
                - Do NOT output globalTheme (omit the field entirely)
                - Keep section backgrounds transparent (bg-transparent, bg-black/10, bg-white/5)

                CRITICAL: Never add opaque backgrounds to sections.
                Sections MUST remain transparent to allow the global theme to show through.

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

                Return a single JSON object:
                {
                    "buildSummary": "<1-2 sentence summary of changes made>",
                    "globalTheme": {  // OPTIONAL: only include if theme was changed
                        "background": "<Tailwind classes>",
                        "textPrimary": "<Tailwind text class>",
                        "textSecondary": "<Tailwind text class>",
                        "accentColor": "<color name>"
                    },
                    "modifiedSections": [
                        {
                            "sectionKey": "<string>",
                            "title": "<string>",
                            "orderIndex": <number>,
                            "reactSource": "<full React/JSX code for the section>",
                            "contentJson": <object with section data>,
                            "changeDescription": "<what was changed in this section>"
                        }
                    ],
                    "deletedSectionKeys": ["<sectionKey>", "..."] // OPTIONAL
                }

                ========================
                CRITICAL: FIX THESE ERRORS
                ========================

                Your previous attempt failed validation. The errors are listed in the user message.

                Common issues to check:
                - Unclosed JSX tags
                - Invalid JSX syntax (using {} incorrectly)
                - Missing return statements
                - Invalid JavaScript expressions inside JSX
                - Mismatched parentheses or braces

                Fix ALL errors and ensure the code compiles correctly.

                IMPORTANT:
                - reactSource must be valid React/JSX code
                - Include ALL sections (modified, unchanged, and newly added), except those deleted
                - Preserve Tailwind CSS classes and Framer Motion
                - Return JSON ONLY. No markdown, no explanations.
                - Only include globalTheme if the user explicitly requested a theme/background change
                """);

        UserMessage user = new UserMessage("""
                CLARIFIER CONTEXT (constraints):
                %s

                CURRENT SECTIONS:
                %s

                SECTION PLANS:
                %s

                AVAILABLE ASSETS (images/videos - use URLs from here only):
                %s

                VALIDATION ERRORS FROM PREVIOUS ATTEMPT:
                %s

                TASK:
                - Fix the validation errors listed above
                - Regenerate the React source code with correct syntax
                - Return the complete corrected sections
                - For "delete" actions, omit the section and add its key to deletedSectionKeys
                - Return JSON only
                """.formatted(contextJson, sectionsJson, plansJson, assetsJson, errorsJson));

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
