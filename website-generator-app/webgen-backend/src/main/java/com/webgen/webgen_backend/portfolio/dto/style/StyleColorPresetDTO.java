package com.webgen.webgen_backend.portfolio.dto.style;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StyleColorPresetDTO {
    private String name;
    private String description;
    private Map<String, String> colors;
}

