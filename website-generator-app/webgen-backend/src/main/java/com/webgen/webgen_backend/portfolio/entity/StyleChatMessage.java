package com.webgen.webgen_backend.portfolio.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StyleChatMessage {
    private String id;
    private String role;
    private String content;
    private String timestamp;
    private List<String> suggestions;
    private String designTip;
    private String previewType;
    private Boolean isStyleComplete;
    private Map<String, String> stylePreferences;
    private Boolean showColorPicker;
    private List<StyleChatColorPreset> recommendedColorPresets;
    private Boolean showTypographyPicker;
    private String recommendedHeadingFont;
    private String recommendedBodyFont;
}
