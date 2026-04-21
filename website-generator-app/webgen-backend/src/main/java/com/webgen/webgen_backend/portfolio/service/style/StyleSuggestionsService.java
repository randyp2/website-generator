package com.webgen.webgen_backend.portfolio.service.style;

import com.webgen.webgen_backend.portfolio.dto.style.StyleSuggestionsRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.style.StyleSuggestionsResponseDTO;

public interface StyleSuggestionsService {
    StyleSuggestionsResponseDTO getSuggestions(StyleSuggestionsRequestDTO req);
}
