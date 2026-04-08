package com.webgen.webgen_backend.portfolio_service.parser;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.dto.portfolio.common.SectionDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class BuilderResponseParserTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private BuilderResponseParser parser;

    @BeforeEach
    void setUp() {
        parser = new BuilderResponseParser(objectMapper);
    }

    // ========================================================================
    // parseSingleRefinedSection — called for every section the builder
    // modifies during a refinement cycle. Each refined section passes
    // through here before JSX validation and persistence.
    // ========================================================================
    @Nested
    class ParseSingleRefinedSection {

        @Test
        void parsesCompleteRefinedSection() {
            // Happy path: builder returns a fully populated refined section
            // with reactSource, contentJson, and a changeDescription.
            String json = """
                {
                  "sectionKey": "hero",
                  "title": "Hero Section",
                  "orderIndex": 1,
                  "reactSource": "export default function Hero() { return <div className='bg-black'>Hello</div>; }",
                  "contentJson": {
                    "headline": "Welcome",
                    "subtext": "Full-stack developer"
                  },
                  "changeDescription": "Darkened background, updated headline font"
                }
                """;

            SectionDTO result = parser.parseSingleRefinedSection(json);

            assertThat(result.getSectionKey()).isEqualTo("hero");
            assertThat(result.getTitle()).isEqualTo("Hero Section");
            assertThat(result.getOrderIndex()).isEqualTo(1);
            assertThat(result.getReactSource()).contains("bg-black");
            assertThat(result.getChangeDescription()).isEqualTo("Darkened background, updated headline font");

            // contentJson preserved as JsonNode for frontend consumption
            assertThat(result.getContentJson().path("headline").asText()).isEqualTo("Welcome");
            assertThat(result.getContentJson().path("subtext").asText()).isEqualTo("Full-stack developer");
        }

        @Test
        void defaultsStringFieldsToEmptyWhenMissing() {
            // LLM omits sectionKey and title — should default to ""
            // rather than null to prevent NPEs in downstream validation.
            String json = """
                {
                  "reactSource": "function X() { return <div/>; }"
                }
                """;

            SectionDTO result = parser.parseSingleRefinedSection(json);

            assertThat(result.getSectionKey()).isEmpty();
            assertThat(result.getTitle()).isEmpty();
            assertThat(result.getReactSource()).isEqualTo("function X() { return <div/>; }");
        }

        @Test
        void defaultsOrderIndexToNullWhenMissing() {
            // orderIndex is nullable — missing means "preserve existing order".
            // The builder checks for null before updating the database.
            String json = """
                {
                  "sectionKey": "hero",
                  "reactSource": "function Hero() { return <div/>; }"
                }
                """;

            SectionDTO result = parser.parseSingleRefinedSection(json);

            assertThat(result.getOrderIndex()).isNull();
        }

        @Test
        void defaultsChangeDescriptionToNullWhenMissing() {
            // changeDescription is null for one-shot generation, only set
            // during refinement. asText(null) returns null when field is missing.
            String json = """
                {
                  "sectionKey": "hero",
                  "reactSource": "function Hero() { return <div/>; }"
                }
                """;

            SectionDTO result = parser.parseSingleRefinedSection(json);

            assertThat(result.getChangeDescription()).isNull();
        }

        @Test
        void skipsContentJsonWhenMissing() {
            // If the LLM doesn't return contentJson, it should stay null.
            // The builder only updates contentJson if present.
            String json = """
                {
                  "sectionKey": "hero",
                  "reactSource": "function Hero() { return <div/>; }"
                }
                """;

            SectionDTO result = parser.parseSingleRefinedSection(json);

            assertThat(result.getContentJson()).isNull();
        }

        @Test
        void preservesContentJsonWhenPresent() {
            // contentJson can be any shape — the parser must preserve it
            // as a raw JsonNode without trying to deserialize it.
            String json = """
                {
                  "sectionKey": "projects",
                  "reactSource": "function Projects() { return <div/>; }",
                  "contentJson": {
                    "items": [
                      { "name": "App1", "tech": ["React", "Node"] },
                      { "name": "App2", "tech": ["Python"] }
                    ]
                  }
                }
                """;

            SectionDTO result = parser.parseSingleRefinedSection(json);

            assertThat(result.getContentJson().path("items").isArray()).isTrue();
            assertThat(result.getContentJson().path("items").size()).isEqualTo(2);
        }
    }

    // ========================================================================
    // Edge cases — malformed LLM output.
    // ========================================================================
    @Nested
    class EdgeCases {

        @Test
        void throwsOnInvalidJson() {
            assertThatThrownBy(() -> parser.parseSingleRefinedSection("not json"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Failed to parse refined section JSON");
        }

        @Test
        void throwsOnNullInput() {
            assertThatThrownBy(() -> parser.parseSingleRefinedSection(null))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        void handlesOrderIndexAsNonNumber() {
            // LLM returns orderIndex as a string — isNumber() check returns false,
            // so it should default to null.
            String json = """
                {
                  "sectionKey": "hero",
                  "orderIndex": "first",
                  "reactSource": "function Hero() { return <div/>; }"
                }
                """;

            SectionDTO result = parser.parseSingleRefinedSection(json);

            assertThat(result.getOrderIndex()).isNull();
        }
    }
}
