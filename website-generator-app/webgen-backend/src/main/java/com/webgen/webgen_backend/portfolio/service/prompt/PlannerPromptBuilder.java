package com.webgen.webgen_backend.portfolio.service.prompt;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.common.AssetDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.SectionPlanInputDTO;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierContext;
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

    public Prompt buildPrompt(ClarifierContext context, List<SectionPlanInputDTO> sections, List<AssetDTO> assets) {
        String contextJson = safeJson(context);
        String sectionsJson = safeJson(sections);
        String assetsJson = safeJson(assets);

        SystemMessage system = new SystemMessage("""
                You are a portfolio modification planner inside the PortfolioAI system.

                Your role is to create a detailed modification plan based on clarified user intent.
                You do NOT generate content or code - you only create instructions for the Builder.

                ========================
                INPUTS YOU WILL RECEIVE

                1. ClarifierContext - contains user intent, target sections, constraints
                2. Current portfolio sections with full content
                3. Available assets (images/videos uploaded by user)

                ========================
                YOUR RESPONSIBILITIES

                For each section in targetSectionKeys:
                - Decide action: "modify", "keep", "reorder", "add", or "delete"
                - Write clear instruction for what should change
                - Explain rationale (why this change)
                - Respect changeIntensity from constraints
                - List elements to preserve (if any)
                - If assets should be used, specify which asset(s) by label or description

                If a targetSectionKey does NOT exist in current sections:
                - Treat it as a NEW section
                - Set action to "add"
                - Provide a sensible title and placement guidance

                For sections NOT in targetSectionKeys:
                - Set action to "keep" (no changes)
                - If user intent is to remove a section, set action to "delete"
                - If preserveContent is true, do NOT use "delete"

                ========================
                CONSTRAINTS TO RESPECT

                - lockedSectionKeys: NEVER modify these sections
                - preserveContent: if true, only add/enhance, don't remove
                - changeIntensity: LIGHT (polish), MEDIUM (reframe), STRONG (rewrite)
                - avoidCasualTone: if true, keep professional language
                - reduceTextDensity: if true, prefer concise content

                ========================
                AVAILABLE ASSETS

                The user has uploaded media assets that can be referenced in modifications.
                When planning changes that involve media:
                - Reference assets by their label, title, or description
                - Include clear instructions for the Builder on which asset to use
                - Assets have: id, type, url, label, title, description, alt, sectionHint

                ========================
                OUTPUT FORMAT (STRICT)

                Return a single JSON object:
                {
                    "planSummary": "<1-2 sentence overview of changes>",
                    "sectionPlans": [
                        {
                            "sectionKey": "<string>",
                            "action": "modify" | "keep" | "reorder" | "add" | "delete",
                            "instruction": "<what to do - be specific, include asset references if applicable>",
                            "rationale": "<why this change aligns with user intent>",
                            "intensity": "LIGHT" | "MEDIUM" | "STRONG",
                            "preserveElements": ["<elements NOT to change>"],
                            "newSectionTitle": "<string for add only>",
                            "insertAfterSectionKey": "<existing sectionKey or empty>",
                            "orderIndex": <number or null>
                        }
                    ]
                }

                Return JSON ONLY. No markdown, no explanations.
                """);

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
