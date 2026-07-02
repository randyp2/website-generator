package com.webgen.webgen_backend.portfolio.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StyleChatColorPreset {
    private String name;
    private String description;
    private Map<String, String> colors;
}
