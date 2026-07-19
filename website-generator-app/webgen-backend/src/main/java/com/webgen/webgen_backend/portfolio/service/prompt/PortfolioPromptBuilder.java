package com.webgen.webgen_backend.portfolio.service.prompt;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.*;
import com.webgen.webgen_backend.portfolio.dto.common.*;
import com.webgen.webgen_backend.portfolio.dto.builder.ValidationResult;
import com.webgen.webgen_backend.portfolio.util.SectionNames;
import com.webgen.webgen_backend.resume.dto.ParsedResumeDTO;
import com.webgen.webgen_backend.shared.util.PromptResourceLoader;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Assembles the portfolio generation prompts. Prompt text lives in
 * resources/prompts/portfolio/*.md; this class only supplies runtime values.
 */
@Service
@RequiredArgsConstructor
public class PortfolioPromptBuilder {

    private static final String PROMPT_DIR = "prompts/portfolio/";

    private final ObjectMapper objectMapper = new ObjectMapper();

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
        SystemMessage system = new SystemMessage(
                PromptResourceLoader.load(PROMPT_DIR + "one-shot-system.md"));

        UserMessage user = new UserMessage(PromptResourceLoader.render(
                PROMPT_DIR + "one-shot-user.md",
                generationRequestValues(req, refinedPrompt)));

        return new Prompt(List.of(system, user));
    }

    /**
     * Builds the planning prompt that plans the direction of this portfolio style and
     * content wise. No React code is generated; the blueprint locks in a shared design
     * idea so sections remain coherent.
     *
     * @param req           request holding metadata of user for more context
     * @param refinedPrompt refined user prompt
     * @return structured raw json prompt for overall theme and plan of portfolio
     */
    public Prompt buildBlueprintPrompt(PortfolioGenerateRequestDTO req, String refinedPrompt) {
        SystemMessage system = new SystemMessage(
                PromptResourceLoader.load(PROMPT_DIR + "blueprint-system.md"));

        UserMessage user = new UserMessage(PromptResourceLoader.render(
                PROMPT_DIR + "blueprint-user.md",
                generationRequestValues(req, refinedPrompt)));

        return new Prompt(List.of(system, user));
    }

    /**
     * Builds a prompt to generate one section's React code.
     * Uses the blueprint for design context plus the plan item for the target section.
     *
     * @param req           original generation req with metadata (resume, assets, etc.)
     * @param refinedPrompt refined user prompt passed through LLM
     * @param blueprint     blueprint holding the overall portfolio direction
     * @param targetSection which section to generate
     * @return prompt with system and user messages
     */
    public Prompt buildSectionPrompt(
            PortfolioGenerateRequestDTO req,
            String refinedPrompt,
            BlueprintDTO blueprint,
            BlueprintSectionPlanDTO targetSection
    ) {
        String themeJson;
        try {
            themeJson = objectMapper.writeValueAsString(blueprint.getGlobalThemeDTO());
        } catch (JsonProcessingException e) {
            themeJson = "{}";
        }

        SystemMessage system = new SystemMessage(PromptResourceLoader.render(
                PROMPT_DIR + "section-system.md",
                Map.of(
                        "designDirective", safe(blueprint.getDesignDirective()),
                        "globalTheme", themeJson
                )));

        Map<String, String> userValues = new HashMap<>(resumeValues(req, refinedPrompt));
        userValues.put("sectionKey", safe(targetSection.getSectionKey()));
        userValues.put("orderIndex", String.valueOf(targetSection.getOrderIndex()));
        userValues.put("layoutHint", safe(targetSection.getLayoutHint()));
        userValues.put("contentStrategy", safe(targetSection.getContentStrategy()));

        UserMessage user = new UserMessage(PromptResourceLoader.render(
                PROMPT_DIR + "section-user.md", userValues));

        return new Prompt(List.of(system, user));
    }

    /**
     * Builds the retry prompt for a section that failed validation. Sends the errors,
     * the failed code, and the LOCKED contentJson: the LLM must fix only the
     * reactSource while sectionKey, title, orderIndex, and contentJson stay frozen
     * from attempt 1.
     */
    public Prompt buildSectionRetryPrompt(
            PortfolioGenerateRequestDTO req,
            String refinedPrompt,
            BlueprintDTO blueprint,
            BlueprintSectionPlanDTO targetSection,
            List<ValidationResult.ValidationError> errors,
            String failedReactSource,
            JsonNode lockedContentJson
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

        SystemMessage system = new SystemMessage(PromptResourceLoader.render(
                PROMPT_DIR + "section-retry-system.md",
                Map.of(
                        "errorSummary", errorSummary,
                        "sectionKey", safe(targetSection.getSectionKey()),
                        "title", safe(targetSection.getTitle()),
                        "orderIndex", String.valueOf(targetSection.getOrderIndex()),
                        "contentJson", contentJsonStr,
                        "fieldList", fieldList,
                        "componentName", SectionNames.toPascalCase(targetSection.getSectionKey())
                )));

        UserMessage user = new UserMessage(PromptResourceLoader.render(
                PROMPT_DIR + "section-retry-user.md",
                Map.of("failedReactSource",
                        failedReactSource != null ? failedReactSource : "(no previous code available)")));

        return new Prompt(List.of(system, user));
    }

    /* ============== TEMPLATE VALUE BUILDERS ============== */

    /*
     * Shared value map for the one-shot and blueprint user templates: refined
     * prompt, template id, style preferences, and the serialized resume/assets.
     */
    private Map<String, String> generationRequestValues(PortfolioGenerateRequestDTO req, String refinedPrompt) {
        Map<String, String> values = new HashMap<>(resumeValues(req, refinedPrompt));
        values.put("templateId", safe(req.getTemplateId()));
        values.put("stylePrefs", formatStylePrefs(req.getStylePrefs()));
        return values;
    }

    /* Resume, asset, and prompt values common to every generation user template. */
    private Map<String, String> resumeValues(PortfolioGenerateRequestDTO req, String refinedPrompt) {
        ParsedResumeDTO resume = req.getResume();
        String customNotes = extractCustomNotes(req.getStylePrefs());

        Map<String, String> values = new HashMap<>();
        values.put("userPrompt", safe(applyCustomNotes(refinedPrompt, customNotes)));
        values.put("customNotes", customNotes.isBlank() ? "none" : customNotes);
        values.put("fullName", resume == null ? "none" : safeOrNone(resume.getFullName()));
        values.put("summary", resume == null ? "none" : safeOrNone(resume.getSummary()));
        values.put("contactInfo", formatContactInfo(resume));
        values.put("skills", resume == null ? "none" : formatList(resume.getSkills()));
        values.put("experience", resume == null || resume.getExperiences() == null
                ? "none" : resume.getExperiences().toString());
        values.put("projects", resume == null || resume.getProjects() == null
                ? "none" : resume.getProjects().toString());
        values.put("education", resume == null || resume.getEducations() == null
                ? "none" : resume.getEducations().toString());
        values.put("assets", serializeAssets(req.getAssets()));
        return values;
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
    private String safeOrNone(String text) {
        return text == null ? "none" : text;
    }

    /** Returns the string value or empty string when null, for required template values. */
    private String safe(String text) {
        return text == null ? "" : text;
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
}
