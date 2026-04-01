package com.webgen.webgen_backend.model.portfolio.style;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class StyleContext {
    private int currentQuestionNumber;      // 0=not started, 1-10
    private int totalQuestions;             // always 10
    private boolean styleDiscoveryComplete;
    private String currentQuestion;         // text of current question
    private String designGoal;                     // Q0 data from frontend
    private Map<String, String> colorSelections;  // Q1 data from frontend
    private List<StyleQAPair> conversationHistory;
    private CompiledStylePreferences compiledStylePreferences; // only after Q10
    private String lastUserMessage;
    private int invalidAttemptsForCurrentQuestion;
    private Map<String, String> fontSelections;    // user's font picks from typography picker
    private boolean typographyPickerShown;         // prevent re-triggering
    private String layoutSelection;                // user's layout choice (e.g. "Bento")
}
