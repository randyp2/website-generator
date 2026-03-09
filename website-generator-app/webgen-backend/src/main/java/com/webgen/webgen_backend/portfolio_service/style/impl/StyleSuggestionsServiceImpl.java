package com.webgen.webgen_backend.portfolio_service.style.impl;

import com.webgen.webgen_backend.dto.portfolio.style.StyleSuggestionsRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.style.StyleSuggestionsResponseDTO;
import com.webgen.webgen_backend.portfolio_service.style.StyleSuggestionsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StyleSuggestionsServiceImpl implements StyleSuggestionsService {

    private static final Map<String, List<String>> DEFAULT_SUGGESTIONS = new LinkedHashMap<>();

    static {
        DEFAULT_SUGGESTIONS.put("colorScheme", List.of("Professional Blues", "Vibrant Gradients", "Warm Neutrals"));
        DEFAULT_SUGGESTIONS.put("layoutDensity", List.of("Spacious & Minimal", "Balanced", "Content-Rich"));
        DEFAULT_SUGGESTIONS.put("tone", List.of("Professional", "Creative", "Approachable"));
        DEFAULT_SUGGESTIONS.put("visualStyle", List.of("Modern & Clean", "Classic & Timeless", "Bold & Experimental"));
        DEFAULT_SUGGESTIONS.put("sectionEmphasis", List.of("Work Experience", "Projects", "Skills & Expertise"));
    }

    @Override
    public StyleSuggestionsResponseDTO getSuggestions(StyleSuggestionsRequestDTO req) {
        // Return default suggestions for now; can be extended with AI-driven
        // suggestions based on templateId and resume content in the future
        return new StyleSuggestionsResponseDTO(true, DEFAULT_SUGGESTIONS, false);
    }
}
