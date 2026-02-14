package com.webgen.webgen_backend.dto.portfolio;

import lombok.Data;

import java.util.Map;

@Data
public class GlobalThemeDTO {
    private String background;      // Tailwind classes: "bg-gradient-to-b from-slate-900 to-slate-800"
    private String textPrimary;     // "text-white"
    private String textSecondary;   // "text-slate-400"
    private String accentColor;     // "purple"
    private Map<String, String> fonts; // { "heading": "Playfair Display", "body": "Inter" }
}
