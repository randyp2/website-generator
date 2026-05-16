package com.webgen.webgen_backend.portfolio.service.prompt;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.*;
import com.webgen.webgen_backend.portfolio.dto.common.*;
import com.webgen.webgen_backend.portfolio.dto.builder.ValidationResult;
import com.webgen.webgen_backend.resume.dto.ParsedResumeDTO;
import com.webgen.webgen_backend.shared.prompt.PromptTemplateLoader;
import lombok.RequiredArgsConstructor;
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
    private final PromptTemplateLoader promptTemplateLoader;

    private static final String ONE_SHOT_SYSTEM_TEMPLATE_PATH = "prompts/portfolio/one-shot-system.md";
    private static final String BLUEPRINT_SYSTEM_TEMPLATE_PATH = "prompts/portfolio/blueprint-system.md";
    private static final String SECTION_SYSTEM_TEMPLATE_PATH = "prompts/portfolio/section-system.md";
    private static final String SECTION_RETRY_SYSTEM_TEMPLATE_PATH = "prompts/portfolio/section-retry-system.md";

    /**
     * Builds a one-shot prompt that generates the complete portfolio in a single LLM call.
     * Used as an alternative to the blueprint + per-section flow for templates that
     * support atomic generation.
     *
     * @param req           original generation request with resume, assets, and style prefs
     * @param refinedPrompt user prompt already processed by PromptRefinerService
     * @return prompt containing system rules and user context for full portfolio generation
     */
    public Prompt buildOneShotPrompt(PortfolioGenerateRequestDTO req, String refinedPrompt) {

        ParsedResumeDTO resume = req.getResume();
        String stylePrefs = formatStylePrefs(req.getStylePrefs());
        String customNotes = extractCustomNotes(req.getStylePrefs());
        String effectivePrompt = applyCustomNotes(refinedPrompt, customNotes);

        String assetsJson = serializeAssets(req.getAssets());

        // --- Construct system and user message
        SystemMessage system = new SystemMessage(
                promptTemplateLoader.load(ONE_SHOT_SYSTEM_TEMPLATE_PATH)
        );

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

        SystemMessage system = new SystemMessage(
                promptTemplateLoader.load(BLUEPRINT_SYSTEM_TEMPLATE_PATH)
        );

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

        String sectionSystemTemplate = promptTemplateLoader.load(SECTION_SYSTEM_TEMPLATE_PATH);
        SystemMessage system = new SystemMessage(
                sectionSystemTemplate.formatted(
                        blueprint.getDesignDirective(),
                        themeJson
                )
        );

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

    /* ============== STYLE PREFS HELPERS ============== */

    /** Serializes the stylePrefs map into a flat semicolon-delimited string for the prompt. */
    private String formatStylePrefs(Map<String, String> stylePrefs) {
        if (stylePrefs == null || stylePrefs.isEmpty())
            return "none";
        return stylePrefs.entrySet()
                .stream()
                .map(e -> e.getKey() + ": " + (e.getValue() == null || e.getValue().isBlank() ? "none" : e.getValue()))
                .collect(Collectors.joining("; "));
    }

    /** Pulls the free-text "customNotes" key out of stylePrefs; returns empty string when absent. */
    private String extractCustomNotes(Map<String, String> stylePrefs) {
        if (stylePrefs == null)
            return "";
        String notes = stylePrefs.get("customNotes");
        if (notes == null)
            return "";
        String trimmed = notes.trim();
        return trimmed.isBlank() ? "" : trimmed;
    }

    /** Appends customNotes to the refined prompt so the LLM treats them as hard design requirements. */
    private String applyCustomNotes(String refinedPrompt, String customNotes) {
        if (customNotes == null || customNotes.isBlank())
            return refinedPrompt;
        return refinedPrompt + "\n\nCUSTOM STYLE NOTES (must implement): " + customNotes;
    }

    /* ============== RESUME DATA FORMATTING HELPERS ============== */

    /** Formats a nullable string list as a comma-separated value for prompt injection. */
    private String formatList(List<String> list) {
        return list == null || list.isEmpty() ? "none" : String.join(", ", list);
    }

    /** Returns the string value or "none" when null, preventing literal "null" in prompts. */
    private String safe(String text) {
        return text == null ? "none" : text;
    }

    /*
     * Builds a compact contact info string (email, phone, location) for prompt injection.
     * Only includes fields that are present; returns "none" when all are missing.
     */
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

    /** Serializes the asset list to JSON for embedding in the prompt as structured metadata. */
    private String serializeAssets(List<AssetDTO> assets) {
        if (assets == null || assets.isEmpty())
            return "[]";

        try {
            return objectMapper.writeValueAsString(assets);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize assets for prompt", e);
        }
    }

    /* ============== STRING UTILITIES ============== */

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

        String sectionRetrySystemTemplate = promptTemplateLoader.load(SECTION_RETRY_SYSTEM_TEMPLATE_PATH);
        SystemMessage system = new SystemMessage(sectionRetrySystemTemplate.formatted(
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

    /**
     * Converts a hyphenated sectionKey into PascalCase for the React component function name.
     * Example: "work-experience" becomes "WorkExperience", used as "WorkExperienceSection".
     */
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
