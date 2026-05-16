package com.webgen.webgen_backend.portfolio.service.prompt;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.common.AssetDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.SectionPlanInputDTO;
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
public class PlannerPromptBuilder {
    private final ObjectMapper objectMapper;
    private final PromptTemplateLoader promptTemplateLoader;

    private static final String SYSTEM_TEMPLATE_PATH = "prompts/portfolio/planner-system.md";

    public Prompt buildPrompt(ClarifierContext context, List<SectionPlanInputDTO> sections, List<AssetDTO> assets) {
        String contextJson = safeJson(context);
        String sectionsJson = safeJson(sections);
        String assetsJson = safeJson(assets);

        SystemMessage system = new SystemMessage(promptTemplateLoader.load(SYSTEM_TEMPLATE_PATH));

        UserMessage user = new UserMessage("""
                CLARIFIER CONTEXT:
                %s

                CURRENT SECTIONS:
                %s

                AVAILABLE ASSETS:
                %s

                TASK:
                - Create modification plan for each target section
                - Set action to "keep" for non-target sections
                - If user intent involves media, reference appropriate assets in instructions
                - Return JSON only
                """.formatted(contextJson, sectionsJson, assetsJson));

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
