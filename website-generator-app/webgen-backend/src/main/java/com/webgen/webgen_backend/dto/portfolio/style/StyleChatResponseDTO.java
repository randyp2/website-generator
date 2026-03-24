package com.webgen.webgen_backend.dto.portfolio.style;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class StyleChatResponseDTO {
    private String assistantMessage;
    private int questionNumber;
    private int totalQuestions;           // always 10
    private boolean isComplete;
    private Map<String, String> stylePreferences; // only when isComplete=true
    private boolean showColorPicker;              // signals frontend to render color picker
    private List<StyleColorPresetDTO> recommendedColorPresets; // AI-generated custom palettes (nullable)
    private boolean showTypographyPicker;          // signals frontend to render typography picker
    private String recommendedHeadingFont;         // AI's heading font suggestion (nullable)
    private String recommendedBodyFont;            // AI's body font suggestion (nullable)
    private List<String> suggestions;              // clickable option chips (nullable)
    private String designTip;                      // styled design tip callout (nullable)
    private String previewType;                    // signals frontend to render mini preview cards (nullable)
}
