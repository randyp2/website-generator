package com.webgen.webgen_backend.portfolio.model.style;

import lombok.Data;

@Data
public class CompiledStylePreferences {
    private String colorScheme;
    private String layoutDensity;
    private String tone;
    private String visualStyle;
    private String sectionEmphasis;
    private String typography;
    private String animationStyle;
    private String whitespace;
    private String imageryStyle;
    private String interactiveElements;
    private String customNotes;

    /**
     * Returns a copy of {@code base} with every non-blank field of
     * {@code updates} applied. Blank/missing update fields keep the base value,
     * so an LLM echoing a partial object can never erase existing preferences.
     */
    public static CompiledStylePreferences mergeNonBlank(
            CompiledStylePreferences base,
            CompiledStylePreferences updates
    ) {
        CompiledStylePreferences merged = new CompiledStylePreferences();
        merged.setColorScheme(pick(base.colorScheme, updates.colorScheme));
        merged.setLayoutDensity(pick(base.layoutDensity, updates.layoutDensity));
        merged.setTone(pick(base.tone, updates.tone));
        merged.setVisualStyle(pick(base.visualStyle, updates.visualStyle));
        merged.setSectionEmphasis(pick(base.sectionEmphasis, updates.sectionEmphasis));
        merged.setTypography(pick(base.typography, updates.typography));
        merged.setAnimationStyle(pick(base.animationStyle, updates.animationStyle));
        merged.setWhitespace(pick(base.whitespace, updates.whitespace));
        merged.setImageryStyle(pick(base.imageryStyle, updates.imageryStyle));
        merged.setInteractiveElements(pick(base.interactiveElements, updates.interactiveElements));
        merged.setCustomNotes(pick(base.customNotes, updates.customNotes));
        return merged;
    }

    private static String pick(String base, String update) {
        return update == null || update.isBlank() ? base : update;
    }
}
