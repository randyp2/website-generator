package com.webgen.webgen_backend.portfolio.service.prompt;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.common.AssetDTO;
import com.webgen.webgen_backend.portfolio.dto.clarifier.SectionSummaryDTO;
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
public class ClarifierPromptBuilder {
    private final ObjectMapper objectMapper;
    private final PromptTemplateLoader promptTemplateLoader;

    private static final String SYSTEM_TEMPLATE_PATH = "prompts/portfolio/clarifier-system.md";

    public Prompt buildPrompt(
            String userPrompt,
            List<SectionSummaryDTO> sections,
            ClarifierContext context,
            List<AssetDTO> assets
    ) {
        String sectionsJson = safeJson(sections);
        String contextJson = safeJson(context);
        String assetsJson = safeJson(assets);

        SystemMessage system  = new SystemMessage(promptTemplateLoader.load(SYSTEM_TEMPLATE_PATH));

        UserMessage user = new UserMessage("""
                CURRENT CONTEXT:
                %s

                AVAILABLE SECTIONS:
                %s

                AVAILABLE ASSETS (images/videos the user has uploaded):
                %s

                LATEST USER MESSAGE:
                %s

                TASK:
                - Update the context based on the latest user message
                - If the user mentions using/adding media, note that assets are available
                - Ask the next most important question OR declare completion
                - Return JSON only, no extra text
                """.formatted(
                    contextJson,
                    sectionsJson,
                    assetsJson,
                    safe(userPrompt)
                ));

        return new Prompt(List.of(system, user));
    }

    private String safe(String text) {
        return text == null ? "" : text;
    }


    private String safeJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }
}
