package com.webgen.webgen_backend.portfolio.model.style;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

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
     * Merge outcome: the merged preferences plus the names of fields whose
     * values actually changed (frontend field keys, e.g. "tone").
     */
    public record MergeResult(CompiledStylePreferences merged, List<String> changedFields) {}

    /**
     * Returns a copy of {@code base} with every non-blank field of
     * {@code updates} applied. Blank/missing update fields keep the base value,
     * so an LLM echoing a partial object can never erase existing preferences.
     */
    public static MergeResult mergeNonBlank(
            CompiledStylePreferences base,
            CompiledStylePreferences updates
    ) {
        CompiledStylePreferences merged = new CompiledStylePreferences();
        List<String> changed = new ArrayList<>();
        merged.setColorScheme(pick("colorScheme", base.colorScheme, updates.colorScheme, changed));
        merged.setLayoutDensity(pick("layoutDensity", base.layoutDensity, updates.layoutDensity, changed));
        merged.setTone(pick("tone", base.tone, updates.tone, changed));
        merged.setVisualStyle(pick("visualStyle", base.visualStyle, updates.visualStyle, changed));
        merged.setSectionEmphasis(pick("sectionEmphasis", base.sectionEmphasis, updates.sectionEmphasis, changed));
        merged.setTypography(pick("typography", base.typography, updates.typography, changed));
        merged.setAnimationStyle(pick("animationStyle", base.animationStyle, updates.animationStyle, changed));
        merged.setWhitespace(pick("whitespace", base.whitespace, updates.whitespace, changed));
        merged.setImageryStyle(pick("imageryStyle", base.imageryStyle, updates.imageryStyle, changed));
        merged.setInteractiveElements(pick("interactiveElements", base.interactiveElements, updates.interactiveElements, changed));
        merged.setCustomNotes(pick("customNotes", base.customNotes, updates.customNotes, changed));
        return new MergeResult(merged, changed);
    }

    private static String pick(String field, String base, String update, List<String> changed) {
        if (update == null || update.isBlank() || update.equals(base)) return base;
        changed.add(field);
        return update;
    }
}
