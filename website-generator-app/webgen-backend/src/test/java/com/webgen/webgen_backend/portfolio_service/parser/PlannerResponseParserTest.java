package com.webgen.webgen_backend.portfolio_service.parser;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.dto.portfolio.planner.PlannerResponseDTO;
import com.webgen.webgen_backend.model.portfolio.clarifier.ChangeIntensity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class PlannerResponseParserTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private PlannerResponseParser parser;

    @BeforeEach
    void setUp() {
        parser = new PlannerResponseParser(objectMapper);
    }

    // ========================================================================
    // parse — called once per refinement session after the clarifier finishes.
    // Produces the section-level plan that the builder uses to generate JSX.
    // Wrong plan = wrong sections get modified/added/deleted.
    // ========================================================================
    @Nested
    class ParseFullResponse {

        @Test
        void parsesCompleteResponseWithMultiplePlans() {
            // Happy path: planner returns a summary and multiple section plans
            // with different actions (modify, keep, add, delete).
            String json = """
                {
                  "planSummary": "Darken hero, keep navbar, add testimonials",
                  "sectionPlans": [
                    {
                      "sectionKey": "hero",
                      "action": "modify",
                      "instruction": "Change background to dark gradient",
                      "rationale": "User wants darker theme",
                      "intensity": "STRONG",
                      "preserveElements": ["headline", "cta-button"],
                      "newSectionTitle": "",
                      "insertAfterSectionKey": "",
                      "orderIndex": 1
                    },
                    {
                      "sectionKey": "navbar",
                      "action": "keep",
                      "instruction": "",
                      "rationale": "No changes requested",
                      "intensity": "LIGHT",
                      "preserveElements": [],
                      "newSectionTitle": "",
                      "insertAfterSectionKey": "",
                      "orderIndex": 0
                    },
                    {
                      "sectionKey": "testimonials",
                      "action": "add",
                      "instruction": "Create new testimonials section",
                      "rationale": "User requested social proof",
                      "intensity": "STRONG",
                      "preserveElements": [],
                      "newSectionTitle": "What People Say",
                      "insertAfterSectionKey": "hero",
                      "orderIndex": 2
                    }
                  ]
                }
                """;

            PlannerResponseDTO result = parser.parse(json);

            assertThat(result.getPlanSummary()).isEqualTo("Darken hero, keep navbar, add testimonials");
            // planApproved always defaults to false — user must explicitly approve
            assertThat(result.isPlanApproved()).isFalse();

            assertThat(result.getSectionPlans()).hasSize(3);

            // Verify modify plan
            var heroPlan = result.getSectionPlans().get(0);
            assertThat(heroPlan.getSectionKey()).isEqualTo("hero");
            assertThat(heroPlan.getAction()).isEqualTo("modify");
            assertThat(heroPlan.getIntensity()).isEqualTo(ChangeIntensity.STRONG);
            assertThat(heroPlan.getPreserveElements()).containsExactly("headline", "cta-button");

            // Verify keep plan
            var navPlan = result.getSectionPlans().get(1);
            assertThat(navPlan.getAction()).isEqualTo("keep");
            assertThat(navPlan.getIntensity()).isEqualTo(ChangeIntensity.LIGHT);

            // Verify add plan
            var testPlan = result.getSectionPlans().get(2);
            assertThat(testPlan.getAction()).isEqualTo("add");
            assertThat(testPlan.getNewSectionTitle()).isEqualTo("What People Say");
            assertThat(testPlan.getInsertAfterSectionKey()).isEqualTo("hero");
        }

        @Test
        void handlesEmptySectionPlansArray() {
            // Edge case: planner returns a summary but no actual section plans.
            // This can happen if the clarifier scope was too vague.
            String json = """
                {
                  "planSummary": "No changes needed",
                  "sectionPlans": []
                }
                """;

            PlannerResponseDTO result = parser.parse(json);

            assertThat(result.getPlanSummary()).isEqualTo("No changes needed");
            assertThat(result.getSectionPlans()).isEmpty();
        }

        @Test
        void handlesMissingSectionPlansNode() {
            // If sectionPlans is missing entirely (not an array),
            // the parser should return an empty list rather than NPE.
            String json = """
                {
                  "planSummary": "Summary only"
                }
                """;

            PlannerResponseDTO result = parser.parse(json);

            assertThat(result.getSectionPlans()).isEmpty();
        }
    }

    // ========================================================================
    // Section plan field defaults — LLMs often omit optional fields.
    // The parser must provide safe defaults so the builder doesn't crash.
    // ========================================================================
    @Nested
    class SectionPlanDefaults {

        @Test
        void defaultsActionToKeepWhenMissing() {
            // If the LLM doesn't specify an action, default to "keep" (safest).
            // "keep" means the builder won't touch the section.
            String json = """
                {
                  "planSummary": "",
                  "sectionPlans": [
                    {
                      "sectionKey": "hero"
                    }
                  ]
                }
                """;

            PlannerResponseDTO result = parser.parse(json);

            assertThat(result.getSectionPlans().get(0).getAction()).isEqualTo("keep");
        }

        @Test
        void defaultsIntensityToMediumWhenInvalid() {
            // Unlike the ClarifierResponseParser which throws on invalid intensity,
            // the PlannerResponseParser gracefully falls back to MEDIUM.
            // This is intentional — the planner is less critical than the clarifier.
            String json = """
                {
                  "planSummary": "",
                  "sectionPlans": [
                    {
                      "sectionKey": "hero",
                      "action": "modify",
                      "intensity": "INVALID_VALUE"
                    }
                  ]
                }
                """;

            PlannerResponseDTO result = parser.parse(json);

            assertThat(result.getSectionPlans().get(0).getIntensity()).isEqualTo(ChangeIntensity.MEDIUM);
        }

        @Test
        void defaultsOrderIndexToNullWhenNotNumber() {
            // orderIndex is nullable — if the LLM returns a non-number,
            // it should be null so the builder preserves existing order.
            String json = """
                {
                  "planSummary": "",
                  "sectionPlans": [
                    {
                      "sectionKey": "hero",
                      "orderIndex": "not a number"
                    }
                  ]
                }
                """;

            PlannerResponseDTO result = parser.parse(json);

            assertThat(result.getSectionPlans().get(0).getOrderIndex()).isNull();
        }

        @Test
        void defaultsStringFieldsToEmpty() {
            // Missing string fields should default to "" not null,
            // preventing NPEs in downstream prompt builders.
            String json = """
                {
                  "planSummary": "",
                  "sectionPlans": [
                    {
                      "sectionKey": "hero"
                    }
                  ]
                }
                """;

            PlannerResponseDTO result = parser.parse(json);
            var plan = result.getSectionPlans().get(0);

            assertThat(plan.getInstruction()).isEmpty();
            assertThat(plan.getRationale()).isEmpty();
            assertThat(plan.getNewSectionTitle()).isEmpty();
            assertThat(plan.getInsertAfterSectionKey()).isEmpty();
        }

        @Test
        void defaultsPreserveElementsToEmptyList() {
            // Missing preserveElements should be an empty list, not null.
            String json = """
                {
                  "planSummary": "",
                  "sectionPlans": [
                    {
                      "sectionKey": "hero"
                    }
                  ]
                }
                """;

            PlannerResponseDTO result = parser.parse(json);

            assertThat(result.getSectionPlans().get(0).getPreserveElements()).isEmpty();
        }
    }

    // ========================================================================
    // Edge cases — malformed input from the LLM.
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
        void parsesAllValidIntensityValues() {
            for (ChangeIntensity intensity : ChangeIntensity.values()) {
                String json = """
                    {
                      "planSummary": "",
                      "sectionPlans": [
                        {
                          "sectionKey": "hero",
                          "intensity": "%s"
                        }
                      ]
                    }
                    """.formatted(intensity.name());

                PlannerResponseDTO result = parser.parse(json);
                assertThat(result.getSectionPlans().get(0).getIntensity()).isEqualTo(intensity);
            }
        }
    }
}
