package com.webgen.webgen_backend.portfolio.dto.style;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StyleSuggestionsResponseDTO {
    private boolean success;
    private Map<String, List<String>> suggestions;
    private boolean fallbackUsed;
}
