package com.webgen.webgen_backend.portfolio_service.parser;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.dto.portfolio.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class PortfolioResponseParserTest {

    // Real ObjectMapper — no mocking needed since this is pure JSON parsing
    private final ObjectMapper objectMapper = new ObjectMapper();
    private PortfolioResponseParser parser;

    @BeforeEach
    void setUp() {
        parser = new PortfolioResponseParser(objectMapper);
    }

    // ========================================================================
    // parseBlueprintResponse — the first parse in every generation pipeline.
    // If this breaks, no portfolio gets created.
    // ========================================================================
    @Nested
    class ParseBlueprintResponse {

        @Test
        void parsesCompleteBlueprintWithAllFields() {
            // Simulates a well-formed LLM response with every field populated.
            // This is the happy path that every successful generation hits.
            String json = """
                {
                  "globalTheme": {
                    "background": "bg-slate-900",
                    "textPrimary": "text-white",
                    "textSecondary": "text-gray-400",
                    "accentColor": "purple",
                    "fonts": {
                      "heading": "Playfair Display",
                      "body": "Inter"
                    }
                  },
                  "designDirective": "Modern dark portfolio with purple accents",
                  "sectionPlan": [
                    {
                      "sectionKey": "NAVBAR",
                      "title": "Navigation",
                      "orderIndex": 0,
                      "layoutHint": "sticky top",
                      "contentStrategy": "Name and links"
                    },
                    {
                      "sectionKey": "  Hero  ",
                      "title": "Hero Section",
                      "orderIndex": 1,
                      "layoutHint": "full-width",
                      "contentStrategy": "Summary and CTA"
                    }
                  ],
                  "assistantMessage": {
                    "summary": "I created a dark-themed portfolio",
                    "suggestions": ["Add a blog section", "Change accent to blue"]
                  }
                }
                """;

            BlueprintDTO result = parser.parseBlueprintResponse(json);

            // Global theme fields mapped correctly
            assertThat(result.getGlobalThemeDTO().getBackground()).isEqualTo("bg-slate-900");
            assertThat(result.getGlobalThemeDTO().getAccentColor()).isEqualTo("purple");
            assertThat(result.getGlobalThemeDTO().getFonts())
                    .containsEntry("heading", "Playfair Display")
                    .containsEntry("body", "Inter");

            assertThat(result.getDesignDirective()).isEqualTo("Modern dark portfolio with purple accents");

            // Section keys get normalized to trimmed lowercase —
            // critical because downstream lookups match on lowercase keys
            assertThat(result.getSectionPlan()).hasSize(2);
            assertThat(result.getSectionPlan().get(0).getSectionKey()).isEqualTo("navbar");
            assertThat(result.getSectionPlan().get(1).getSectionKey()).isEqualTo("hero");
            assertThat(result.getSectionPlan().get(1).getOrderIndex()).isEqualTo(1);

            // Assistant message parsed with suggestions list
            assertThat(result.getAssistantMessage().getSummary()).isEqualTo("I created a dark-themed portfolio");
            assertThat(result.getAssistantMessage().getSuggestions()).containsExactly(
                    "Add a blog section", "Change accent to blue"
            );
        }

        @Test
        void throwsWhenGlobalThemeIsMissing() {
            // LLMs occasionally omit required fields. The parser must fail fast
            // so the orchestrator can retry rather than produce a broken portfolio.
            String json = """
                {
                  "designDirective": "some directive",
                  "sectionPlan": []
                }
                """;

            assertThatThrownBy(() -> parser.parseBlueprintResponse(json))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("globaltheme");
        }

        @Test
        void throwsWhenSectionPlanIsNotAnArray() {
            // If the LLM returns sectionPlan as a string or object instead of array,
            // we need a clear error — not a silent empty portfolio.
            String json = """
                {
                  "globalTheme": {
                    "background": "bg-white",
                    "textPrimary": "text-black",
                    "textSecondary": "text-gray-500",
                    "accentColor": "blue"
                  },
                  "sectionPlan": "not an array"
                }
                """;

            assertThatThrownBy(() -> parser.parseBlueprintResponse(json))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("sectionPlan");
        }

        @Test
        void defaultsFontsWhenFontsNodeIsMissing() {
            // LLMs sometimes skip the fonts object entirely.
            // The parser should still produce a valid blueprint (fonts are optional).
            String json = """
                {
                  "globalTheme": {
                    "background": "bg-white",
                    "textPrimary": "text-black",
                    "textSecondary": "text-gray-500",
                    "accentColor": "blue"
                  },
                  "sectionPlan": [],
                  "assistantMessage": { "summary": "done", "suggestions": [] }
                }
                """;

            BlueprintDTO result = parser.parseBlueprintResponse(json);

            // No fonts node → no fonts set (null), no crash
            assertThat(result.getGlobalThemeDTO().getFonts()).isNull();
            assertThat(result.getGlobalThemeDTO().getBackground()).isEqualTo("bg-white");
        }

        @Test
        void handlesAssistantMessageWithEmptySuggestions() {
            // Common LLM output — message present but suggestions array is empty.
            String json = """
                {
                  "globalTheme": {
                    "background": "bg-white",
                    "textPrimary": "text-black",
                    "textSecondary": "text-gray-500",
                    "accentColor": "blue"
                  },
                  "sectionPlan": [],
                  "assistantMessage": {
                    "summary": "Portfolio generated",
                    "suggestions": []
                  }
                }
                """;

            BlueprintDTO result = parser.parseBlueprintResponse(json);

            assertThat(result.getAssistantMessage().getSummary()).isEqualTo("Portfolio generated");
            assertThat(result.getAssistantMessage().getSuggestions()).isEmpty();
        }
    }

    // ========================================================================
    // Markdown fence stripping — LLMs frequently wrap JSON in ```json fences.
    // Every parse method calls stripMarkdownFence(), so if this breaks,
    // ALL parsing fails.
    // ========================================================================
    @Nested
    class MarkdownFenceStripping {

        @Test
        void stripsJsonCodeFence() {
            // Most common LLM quirk: wrapping valid JSON in ```json ... ```
            String fenced = """
                ```json
                {
                  "globalTheme": {
                    "background": "bg-white",
                    "textPrimary": "text-black",
                    "textSecondary": "text-gray-500",
                    "accentColor": "blue"
                  },
                  "sectionPlan": [],
                  "assistantMessage": { "summary": "ok", "suggestions": [] }
                }
                ```
                """;

            // Should parse without error — fence is transparently removed
            BlueprintDTO result = parser.parseBlueprintResponse(fenced);
            assertThat(result.getGlobalThemeDTO().getBackground()).isEqualTo("bg-white");
        }

        @Test
        void stripsPlainCodeFence() {
            // Some models use ``` without the json language tag
            String fenced = """
                ```
                {
                  "globalTheme": {
                    "background": "bg-black",
                    "textPrimary": "text-white",
                    "textSecondary": "text-gray-400",
                    "accentColor": "red"
                  },
                  "sectionPlan": [],
                  "assistantMessage": { "summary": "ok", "suggestions": [] }
                }
                ```
                """;

            BlueprintDTO result = parser.parseBlueprintResponse(fenced);
            assertThat(result.getGlobalThemeDTO().getAccentColor()).isEqualTo("red");
        }

        @Test
        void passesRawJsonThrough() {
            // When the LLM behaves perfectly and returns raw JSON (no fences),
            // stripMarkdownFence should be a no-op.
            String raw = """
                {
                  "globalTheme": {
                    "background": "bg-white",
                    "textPrimary": "text-black",
                    "textSecondary": "text-gray-500",
                    "accentColor": "green"
                  },
                  "sectionPlan": [],
                  "assistantMessage": { "summary": "ok", "suggestions": [] }
                }
                """;

            BlueprintDTO result = parser.parseBlueprintResponse(raw);
            assertThat(result.getGlobalThemeDTO().getAccentColor()).isEqualTo("green");
        }
    }

    // ========================================================================
    // parseSingleSectionResponse — called by SectionGenerationWorker for
    // every individual section during parallel generation.
    // Hits 5-8x per portfolio (once per section).
    // ========================================================================
    @Nested
    class ParseSingleSectionResponse {

        @Test
        void parsesValidSection() {
            String json = """
                {
                  "sectionKey": "  HERO  ",
                  "title": "Hero Section",
                  "orderIndex": 1,
                  "contentJson": { "headline": "Welcome" },
                  "reactSource": "export default function Hero() { return <div>Hello</div>; }"
                }
                """;

            SectionDTO result = parser.parseSingleSectionResponse(json);

            // Key normalized: trimmed + lowercased
            assertThat(result.getSectionKey()).isEqualTo("hero");
            assertThat(result.getTitle()).isEqualTo("Hero Section");
            assertThat(result.getOrderIndex()).isEqualTo(1);
            assertThat(result.getReactSource()).contains("Hero()");

            // contentJson preserved as a JsonNode (not deserialized further)
            assertThat(result.getContentJson().path("headline").asText()).isEqualTo("Welcome");
        }

        @Test
        void sanitizesControlCharactersInReactSource() {
            // LLMs occasionally inject invisible control characters (bell, backspace, etc.)
            // that break frontend rendering. The parser must strip them.
            String json = """
                {
                  "sectionKey": "hero",
                  "title": "Hero",
                  "orderIndex": 0,
                  "contentJson": {},
                  "reactSource": "function Hero() {\\u0007 return <div>Hello</div>; }"
                }
                """;

            SectionDTO result = parser.parseSingleSectionResponse(json);

            // Bell character (U+0007) must be removed
            assertThat(result.getReactSource()).doesNotContain("\u0007");
            // But normal whitespace (tabs, newlines) should survive
            assertThat(result.getReactSource()).contains("Hero()");
        }

        @Test
        void handlesNullSectionKeyGracefully() {
            // If sectionKey is missing, normalizeSectionKey returns null
            // rather than crashing. The orchestrator handles the null downstream.
            String json = """
                {
                  "title": "Untitled",
                  "orderIndex": 0,
                  "contentJson": {},
                  "reactSource": "function X() { return <div/>; }"
                }
                """;

            SectionDTO result = parser.parseSingleSectionResponse(json);

            // path("sectionKey").asText() returns "" for missing node, normalize("") → ""
            assertThat(result.getSectionKey()).isEmpty();
        }
    }

    // ========================================================================
    // validateGenerateResponse — guards against incomplete LLM output.
    // Called after parseGenerateResponse in the legacy one-shot flow.
    // Prevents saving a portfolio with missing navbar/footer/sections.
    // ========================================================================
    @Nested
    class ValidateGenerateResponse {

        @Test
        void passesValidResponse() {
            // Minimum valid response: navbar first, footer last, both have reactSource
            PortfolioGenerateResponseDTO response = buildValidResponse();

            // Should not throw
            assertThatCode(() -> parser.validateGenerateResponse(response))
                    .doesNotThrowAnyException();
        }

        @Test
        void throwsWhenSectionsListIsEmpty() {
            PortfolioGenerateResponseDTO response = new PortfolioGenerateResponseDTO();
            response.setSections(java.util.List.of());
            response.setAssistantMessage(new AssistantMessageDTO());

            assertThatThrownBy(() -> parser.validateGenerateResponse(response))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("no sections");
        }

        @Test
        void throwsWhenNavbarIsNotFirstSection() {
            // The frontend renders sections in order and expects navbar at index 0.
            // If the LLM puts hero first, the UI breaks.
            PortfolioGenerateResponseDTO response = buildValidResponse();
            response.getSections().getFirst().setSectionKey("hero"); // not "navbar"

            assertThatThrownBy(() -> parser.validateGenerateResponse(response))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Navbar");
        }

        @Test
        void throwsWhenFooterIsNotLastSection() {
            PortfolioGenerateResponseDTO response = buildValidResponse();
            response.getSections().getLast().setSectionKey("hero"); // not "footer"

            assertThatThrownBy(() -> parser.validateGenerateResponse(response))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("footer");
        }

        @Test
        void throwsWhenAnySectionHasBlankReactSource() {
            // A section without reactSource = an empty slot in the rendered portfolio.
            PortfolioGenerateResponseDTO response = buildValidResponse();
            response.getSections().get(1).setReactSource("   "); // blank middle section

            assertThatThrownBy(() -> parser.validateGenerateResponse(response))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("React source missing");
        }

        @Test
        void throwsWhenAssistantMessageIsNull() {
            PortfolioGenerateResponseDTO response = buildValidResponse();
            response.setAssistantMessage(null);

            assertThatThrownBy(() -> parser.validateGenerateResponse(response))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Assistant message");
        }

        // -- Helper: builds a minimal valid response to mutate in each test --
        private PortfolioGenerateResponseDTO buildValidResponse() {
            SectionDTO navbar = new SectionDTO();
            navbar.setSectionKey("navbar");
            navbar.setReactSource("function Navbar() { return <nav/>; }");

            SectionDTO hero = new SectionDTO();
            hero.setSectionKey("hero");
            hero.setReactSource("function Hero() { return <div/>; }");

            SectionDTO footer = new SectionDTO();
            footer.setSectionKey("footer");
            footer.setReactSource("function Footer() { return <footer/>; }");

            PortfolioGenerateResponseDTO response = new PortfolioGenerateResponseDTO();
            response.setSections(new java.util.ArrayList<>(java.util.List.of(navbar, hero, footer)));
            response.setAssistantMessage(new AssistantMessageDTO());
            return response;
        }
    }

    // ========================================================================
    // parseGenerateResponse — the legacy one-shot parse.
    // Still used in the /api/generate demo endpoint.
    // Tests the full parse: theme + assistantMessage + sections array.
    // ========================================================================
    @Nested
    class ParseGenerateResponse {

        @Test
        void parsesCompleteResponse() {
            String json = """
                {
                  "globalTheme": {
                    "background": "bg-slate-900",
                    "textPrimary": "text-white",
                    "textSecondary": "text-gray-400",
                    "accentColor": "purple"
                  },
                  "assistantMessage": {
                    "summary": "Built your portfolio",
                    "suggestions": ["Add projects"]
                  },
                  "sections": [
                    {
                      "sectionKey": "NAVBAR",
                      "title": "Nav",
                      "orderIndex": 0,
                      "contentJson": {},
                      "reactSource": "function Navbar() { return <nav/>; }"
                    },
                    {
                      "sectionKey": "footer",
                      "title": "Footer",
                      "orderIndex": 1,
                      "contentJson": {},
                      "reactSource": "function Footer() { return <footer/>; }"
                    }
                  ]
                }
                """;

            PortfolioGenerateResponseDTO result = parser.parseGenerateResponse(json);

            assertThat(result.getGlobalTheme().getBackground()).isEqualTo("bg-slate-900");
            assertThat(result.getAssistantMessage().getSuggestions()).containsExactly("Add projects");

            // Section keys normalized to lowercase
            assertThat(result.getSections()).hasSize(2);
            assertThat(result.getSections().get(0).getSectionKey()).isEqualTo("navbar");
        }

        @Test
        void throwsWhenSectionsFieldIsNotArray() {
            String json = """
                {
                  "globalTheme": { "background": "bg-white", "textPrimary": "t", "textSecondary": "t", "accentColor": "t" },
                  "assistantMessage": { "summary": "ok", "suggestions": [] },
                  "sections": "oops"
                }
                """;

            assertThatThrownBy(() -> parser.parseGenerateResponse(json))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasRootCauseMessage("AI response sections field is not an array");
        }

        @Test
        void throwsWhenAssistantMessageIsMissing() {
            String json = """
                {
                  "globalTheme": { "background": "bg-white", "textPrimary": "t", "textSecondary": "t", "accentColor": "t" },
                  "sections": []
                }
                """;

            assertThatThrownBy(() -> parser.parseGenerateResponse(json))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasRootCauseMessage("Assistant message node missing");
        }

        @Test
        void throwsOnCompletelyInvalidJson() {
            // LLM returns garbage — must throw, not return a half-built object
            assertThatThrownBy(() -> parser.parseGenerateResponse("not json at all"))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        void throwsOnNullInput() {
            // Null input can happen if the LLM returns an empty response body
            assertThatThrownBy(() -> parser.parseGenerateResponse(null))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }
}
