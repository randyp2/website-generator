package com.webgen.webgen_backend.portfolio.entity;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class StyleChatMessageTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void preservesRichStyleChatFieldsDuringJsonRoundTrip() throws Exception {
        String json = """
                {
                  "id": "ai-1",
                  "role": "ai",
                  "content": "Pick a palette.",
                  "timestamp": "2026-07-02T12:00:00.000Z",
                  "suggestions": ["Warm editorial", "Dark luxury"],
                  "designTip": "Use warm contrast sparingly.",
                  "previewType": "layout_style",
                  "isStyleComplete": false,
                  "stylePreferences": {
                    "tone": "premium"
                  },
                  "showColorPicker": true,
                  "recommendedColorPresets": [
                    {
                      "name": "Amber Editorial",
                      "description": "Warm premium neutrals.",
                      "colors": {
                        "primary": "#eca449",
                        "secondary": "#4b2d17",
                        "accent": "#f6c76f",
                        "background": "#101010",
                        "text": "#fff8ea",
                        "muted": "#2d241a"
                      }
                    }
                  ],
                  "showTypographyPicker": true,
                  "recommendedHeadingFont": "Inter",
                  "recommendedBodyFont": "Source Serif 4"
                }
                """;

        StyleChatMessage message = objectMapper.readValue(
                json,
                StyleChatMessage.class
        );
        String serialized = objectMapper.writeValueAsString(message);

        assertThat(message.getSuggestions()).containsExactly(
                "Warm editorial",
                "Dark luxury"
        );
        assertThat(message.getDesignTip()).isEqualTo("Use warm contrast sparingly.");
        assertThat(message.getPreviewType()).isEqualTo("layout_style");
        assertThat(message.getStylePreferences()).containsEntry("tone", "premium");
        assertThat(message.getShowColorPicker()).isTrue();
        assertThat(message.getRecommendedColorPresets())
                .singleElement()
                .satisfies(preset -> {
                    assertThat(preset.getName()).isEqualTo("Amber Editorial");
                    assertThat(preset.getColors()).containsEntry("primary", "#eca449");
                });
        assertThat(message.getShowTypographyPicker()).isTrue();
        assertThat(message.getRecommendedHeadingFont()).isEqualTo("Inter");
        assertThat(message.getRecommendedBodyFont()).isEqualTo("Source Serif 4");

        assertThat(serialized).contains("\"showColorPicker\":true");
        assertThat(serialized).contains("\"recommendedHeadingFont\":\"Inter\"");
        assertThat(serialized).contains("\"recommendedColorPresets\"");
    }
}
