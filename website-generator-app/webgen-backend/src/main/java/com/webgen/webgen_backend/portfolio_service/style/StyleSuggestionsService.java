package com.webgen.webgen_backend.portfolio_service.style;

import com.webgen.webgen_backend.dto.portfolio.style.StyleSuggestionsRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.style.StyleSuggestionsResponseDTO;

public interface StyleSuggestionsService {
    StyleSuggestionsResponseDTO getSuggestions(StyleSuggestionsRequestDTO req);
}
