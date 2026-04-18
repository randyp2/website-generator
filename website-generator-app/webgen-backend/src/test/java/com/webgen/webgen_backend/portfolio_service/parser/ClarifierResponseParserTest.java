package com.webgen.webgen_backend.portfolio_service.parser;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.clarifier.ClarifierResponseDTO;
import com.webgen.webgen_backend.portfolio.model.clarifier.ChangeIntensity;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierContext;
import com.webgen.webgen_backend.portfolio.service.parser.ClarifierResponseParser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ClarifierResponseParserTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private ClarifierResponseParser parser;

    @BeforeEach
    void setUp() {
        parser = new ClarifierResponseParser(objectMapper);
    }

    // ========================================================================
    // parse — called every turn of the clarification dialogue.
    // A multi-turn conversation means this runs 1-5x per refinement session.
    // It must correctly extract the DTO AND store the updated context as
    // side-state (lastUpdatedContext) for the next turn.
    // ========================================================================
    @Nested
    class ParseFullResponse {

        @Test
        void parsesCompleteResponseWithAllFields() {
            // Happy path: LLM returns a fully populated clarifier response.
            // This is the structure every successful clarification turn produces.
            String json = """
                {
                  "assistantMessage": "I'll update the hero section with a darker theme.",
                  "readyForPlanning": true,
                  "clarificationComplete": true,
                  "updatedContext": {
                    "confidenceScore": 0.85,
                    "globalIntent": "Make portfolio darker and more minimal",
                    "scope": "section",
                    "lastUserMessage": "Make the hero darker",
                    "turnCount": 2,
                    "sectionIntents": {
                      "hero": "Darken background, reduce text",
                      "navbar": "Match hero theme"
                    },
                    "targetSectionKeys": ["hero", "navbar"],
                    "openQuestions": [],
                    "assumptions": ["User wants dark mode across targeted sections"],
                    "constraints": {
                      "avoidCasualTone": true,
                      "reduceTextDensity": false,
                      "preserveContent": true,
                      "changeIntensity": "LIGHT",
                      "lockedSectionKeys": ["footer"]
                    }
                  }
                }
                """;

            ClarifierResponseDTO dto = parser.parse(json);

            // Top-level DTO fields
            assertThat(dto.getAssistantMessage()).isEqualTo("I'll update the hero section with a darker theme.");
            assertThat(dto.isReadyForPlanning()).isTrue();
            assertThat(dto.isClarificationComplete()).isTrue();

            // Context is stored as side-state — retrieved via getUpdatedContext()
            // This is how ClarifierService chains multi-turn dialogue
            ClarifierContext ctx = parser.getUpdatedContext();
            assertThat(ctx).isNotNull();
            assertThat(ctx.getConfidenceScore()).isEqualTo(0.85);
            assertThat(ctx.getGlobalIntent()).isEqualTo("Make portfolio darker and more minimal");
            assertThat(ctx.getScope()).isEqualTo("section");
            assertThat(ctx.getTurnCount()).isEqualTo(2);
            assertThat(ctx.getLastUserMessage()).isEqualTo("Make the hero darker");

            // Section intents map: sectionKey -> intent string
            assertThat(ctx.getSectionIntents())
                    .containsEntry("hero", "Darken background, reduce text")
                    .containsEntry("navbar", "Match hero theme")
                    .hasSize(2);

            // Target sections and assumptions
            assertThat(ctx.getTargetSectionKeys()).containsExactly("hero", "navbar");
            assertThat(ctx.getOpenQuestions()).isEmpty();
            assertThat(ctx.getAssumptions()).containsExactly("User wants dark mode across targeted sections");

            // Constraints parsed with correct types
            assertThat(ctx.getConstraints().isAvoidCasualTone()).isTrue();
            assertThat(ctx.getConstraints().isReduceTextDensity()).isFalse();
            assertThat(ctx.getConstraints().isPreserveContent()).isTrue();
            assertThat(ctx.getConstraints().getChangeIntensity()).isEqualTo(ChangeIntensity.LIGHT);
            assertThat(ctx.getConstraints().getLockedSectionKeys()).containsExactly("footer");
        }

        @Test
        void parsesEarlyClarificationTurnNotReadyForPlanning() {
            // First turn: AI is still asking questions, not ready to proceed.
            // readyForPlanning and clarificationComplete both false.
            String json = """
                {
                  "assistantMessage": "What style are you going for?",
                  "readyForPlanning": false,
                  "clarificationComplete": false,
                  "updatedContext": {
                    "confidenceScore": 0.2,
                    "globalIntent": "",
                    "scope": "unknown",
                    "lastUserMessage": "Change my portfolio",
                    "turnCount": 1,
                    "sectionIntents": {},
                    "targetSectionKeys": [],
                    "openQuestions": ["What sections to change?", "What style?"],
                    "assumptions": [],
                    "constraints": {
                      "avoidCasualTone": false,
                      "reduceTextDensity": false,
                      "preserveContent": false,
                      "changeIntensity": "MEDIUM",
                      "lockedSectionKeys": []
                    }
                  }
                }
                """;

            ClarifierResponseDTO dto = parser.parse(json);

            assertThat(dto.isReadyForPlanning()).isFalse();
            assertThat(dto.isClarificationComplete()).isFalse();

            ClarifierContext ctx = parser.getUpdatedContext();
            assertThat(ctx.getConfidenceScore()).isEqualTo(0.2);
            assertThat(ctx.getScope()).isEqualTo("unknown");
            assertThat(ctx.getSectionIntents()).isEmpty();
            assertThat(ctx.getOpenQuestions()).containsExactly("What sections to change?", "What style?");
        }

        @Test
        void defaultsBooleanFieldsWhenMissing() {
            // LLMs sometimes omit boolean fields entirely.
            // readyForPlanning and clarificationComplete should default to false.
            String json = """
                {
                  "assistantMessage": "Tell me more.",
                  "updatedContext": {
                    "confidenceScore": 0.3,
                    "globalIntent": "",
                    "scope": "unknown",
                    "lastUserMessage": "",
                    "turnCount": 0,
                    "sectionIntents": {},
                    "targetSectionKeys": [],
                    "openQuestions": [],
                    "assumptions": [],
                    "constraints": {
                      "avoidCasualTone": false,
                      "reduceTextDensity": false,
                      "preserveContent": false,
                      "changeIntensity": "MEDIUM",
                      "lockedSectionKeys": []
                    }
                  }
                }
                """;

            ClarifierResponseDTO dto = parser.parse(json);

            // Both default to false when omitted from JSON
            assertThat(dto.isReadyForPlanning()).isFalse();
            assertThat(dto.isClarificationComplete()).isFalse();
        }
    }

    // ========================================================================
    // updatedContext parsing — the most complex part of the response.
    // If context is parsed wrong, the planner and builder receive bad scope,
    // wrong target sections, or incorrect constraints.
    // ========================================================================
    @Nested
    class ContextParsing {

        @Test
        void throwsWhenUpdatedContextIsMissing() {
            // updatedContext is required — without it the clarifier can't
            // track state across turns and the pipeline stalls.
            String json = """
                {
                  "assistantMessage": "Got it.",
                  "readyForPlanning": true,
                  "clarificationComplete": true
                }
                """;

            assertThatThrownBy(() -> parser.parse(json))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasRootCauseMessage("updated context is missing or invalid");
        }

        @Test
        void throwsWhenConstraintsBlockIsMissing() {
            // Constraints are mandatory — they gate what the planner is allowed to do.
            // Missing constraints = planner has no guardrails.
            String json = """
                {
                  "assistantMessage": "Let's proceed.",
                  "readyForPlanning": true,
                  "clarificationComplete": true,
                  "updatedContext": {
                    "confidenceScore": 0.9,
                    "globalIntent": "Redesign",
                    "scope": "global",
                    "lastUserMessage": "Redo everything",
                    "turnCount": 1,
                    "sectionIntents": {},
                    "targetSectionKeys": [],
                    "openQuestions": [],
                    "assumptions": []
                  }
                }
                """;

            assertThatThrownBy(() -> parser.parse(json))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasRootCauseMessage("constraints is missing or invalid");
        }

        @Test
        void defaultsContextFieldsWhenMissing() {
            // LLMs may omit optional context fields. The parser should
            // fall back to safe defaults rather than NPE.
            String json = """
                {
                  "assistantMessage": "Noted.",
                  "updatedContext": {
                    "constraints": {
                      "changeIntensity": "MEDIUM",
                      "lockedSectionKeys": []
                    }
                  }
                }
                """;

            parser.parse(json);
            ClarifierContext ctx = parser.getUpdatedContext();

            // All fields default to their zero-values
            assertThat(ctx.getConfidenceScore()).isEqualTo(0.0);
            assertThat(ctx.getGlobalIntent()).isEmpty();
            assertThat(ctx.getScope()).isEqualTo("unknown");
            assertThat(ctx.getLastUserMessage()).isEmpty();
            assertThat(ctx.getTurnCount()).isZero();
            assertThat(ctx.getTargetSectionKeys()).isEmpty();
            assertThat(ctx.getOpenQuestions()).isEmpty();
            assertThat(ctx.getAssumptions()).isEmpty();
            assertThat(ctx.getSectionIntents()).isEmpty();
        }
    }

    // ========================================================================
    // ChangeIntensity enum parsing — if the LLM returns an invalid intensity,
    // the entire clarifier response is rejected. This matters because
    // intensity gates how aggressively the builder rewrites sections.
    // ========================================================================
    @Nested
    class ChangeIntensityParsing {

        @Test
        void parsesAllValidIntensities() {
            // Verify all three enum values are handled correctly
            for (ChangeIntensity expected : ChangeIntensity.values()) {
                String json = buildJsonWithIntensity(expected.name());

                parser.parse(json);
                ClarifierContext ctx = parser.getUpdatedContext();

                assertThat(ctx.getConstraints().getChangeIntensity()).isEqualTo(expected);
            }
        }

        @Test
        void throwsOnInvalidChangeIntensity() {
            // If the LLM invents an intensity like "EXTREME", we fail fast
            // rather than silently defaulting — the orchestrator should retry.
            String json = buildJsonWithIntensity("EXTREME");

            assertThatThrownBy(() -> parser.parse(json))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        void throwsOnLowercaseIntensity() {
            // The enum uses valueOf() which is case-sensitive.
            // "light" != "LIGHT" — this catches LLMs returning lowercase.
            String json = buildJsonWithIntensity("light");

            assertThatThrownBy(() -> parser.parse(json))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        private String buildJsonWithIntensity(String intensity) {
            return """
                {
                  "assistantMessage": "ok",
                  "updatedContext": {
                    "confidenceScore": 0.5,
                    "globalIntent": "",
                    "scope": "section",
                    "lastUserMessage": "",
                    "turnCount": 1,
                    "sectionIntents": {},
                    "targetSectionKeys": [],
                    "openQuestions": [],
                    "assumptions": [],
                    "constraints": {
                      "avoidCasualTone": false,
                      "reduceTextDensity": false,
                      "preserveContent": false,
                      "changeIntensity": "%s",
                      "lockedSectionKeys": []
                    }
                  }
                }
                """.formatted(intensity);
        }
    }

    // ========================================================================
    // Edge cases — malformed or garbage input from the LLM.
    // The clarifier is conversational so LLM drift is more likely here
    // than in one-shot parsers.
    // ========================================================================
    @Nested
    class EdgeCases {

        @Test
        void throwsOnInvalidJson() {
            assertThatThrownBy(() -> parser.parse("not json"))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        void throwsOnNullInput() {
            assertThatThrownBy(() -> parser.parse(null))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        void handlesEmptySectionIntentsObject() {
            // LLM returns sectionIntents as {} — common on first turn
            // when no specific sections have been discussed yet.
            String json = """
                {
                  "assistantMessage": "What would you like to change?",
                  "updatedContext": {
                    "confidenceScore": 0.1,
                    "globalIntent": "",
                    "scope": "unknown",
                    "lastUserMessage": "help",
                    "turnCount": 1,
                    "sectionIntents": {},
                    "targetSectionKeys": [],
                    "openQuestions": ["What do you want?"],
                    "assumptions": [],
                    "constraints": {
                      "changeIntensity": "MEDIUM",
                      "lockedSectionKeys": []
                    }
                  }
                }
                """;

            parser.parse(json);
            ClarifierContext ctx = parser.getUpdatedContext();

            assertThat(ctx.getSectionIntents()).isEmpty();
        }

        @Test
        void handlesNonArrayFieldsGracefully() {
            // If LLM returns targetSectionKeys as a non-array (string, null, etc.),
            // readStringList should return an empty list rather than crashing.
            String json = """
                {
                  "assistantMessage": "ok",
                  "updatedContext": {
                    "confidenceScore": 0.5,
                    "globalIntent": "",
                    "scope": "section",
                    "lastUserMessage": "",
                    "turnCount": 1,
                    "sectionIntents": {},
                    "targetSectionKeys": "not an array",
                    "openQuestions": "also not an array",
                    "assumptions": "still not",
                    "constraints": {
                      "changeIntensity": "MEDIUM",
                      "lockedSectionKeys": []
                    }
                  }
                }
                """;

            parser.parse(json);
            ClarifierContext ctx = parser.getUpdatedContext();

            // readStringList returns empty list for non-array nodes
            assertThat(ctx.getTargetSectionKeys()).isEmpty();
            assertThat(ctx.getOpenQuestions()).isEmpty();
            assertThat(ctx.getAssumptions()).isEmpty();
        }
    }
}
