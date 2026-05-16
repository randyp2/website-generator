package com.webgen.webgen_backend.portfolio.service.prompt;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.common.AssetDTO;
import com.webgen.webgen_backend.portfolio.dto.builder.ValidationResult;
import com.webgen.webgen_backend.portfolio.dto.planner.SectionContentDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.SectionPlanDTO;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierContext;
import com.webgen.webgen_backend.shared.prompt.PromptTemplateLoader;
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
    private final PromptTemplateLoader promptTemplateLoader;

    private static final String SINGLE_SECTION_SYSTEM_TEMPLATE_PATH =
            "prompts/portfolio/builder-single-section-system.md";
    private static final String SINGLE_SECTION_RETRY_SYSTEM_TEMPLATE_PATH =
            "prompts/portfolio/builder-single-section-retry-system.md";

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

        SystemMessage system = new SystemMessage(
                promptTemplateLoader.load(SINGLE_SECTION_SYSTEM_TEMPLATE_PATH)
        );

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

        SystemMessage system = new SystemMessage(
                promptTemplateLoader.load(SINGLE_SECTION_RETRY_SYSTEM_TEMPLATE_PATH)
        );

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
