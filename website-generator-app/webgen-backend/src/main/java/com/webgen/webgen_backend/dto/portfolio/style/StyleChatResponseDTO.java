package com.webgen.webgen_backend.dto.portfolio.style;

import lombok.Data;

import java.util.Map;

@Data
public class StyleChatResponseDTO {
    private String assistantMessage;
    private int questionNumber;
    private int totalQuestions;           // always 10
    private boolean isComplete;
    private Map<String, String> stylePreferences; // only when isComplete=true
    private boolean showColorPicker;              // signals frontend to render color picker
}
