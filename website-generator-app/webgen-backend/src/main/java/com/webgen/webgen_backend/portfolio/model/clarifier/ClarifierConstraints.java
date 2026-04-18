package com.webgen.webgen_backend.portfolio.model.clarifier;

import lombok.Data;

import java.util.List;


@Data
public class ClarifierConstraints {
    /**
     * Enforce professional / formal language.
     * No slang, jokes, emojis, or conversational copy.
     */
    private boolean avoidCasualTone;

    /**
     * Prefer concise, scannable content.
     * Reduce paragraphs, tighten copy, emphasize hierarchy.
     */
    private boolean reduceTextDensity;

    /**
     * Prevent removal of existing content.
     * Rewriting and reordering allowed, deletion not allowed.
     */
    private boolean preserveContent;

    /**
     * Limit how aggressively content may be changed.
     * LIGHT = polish only
     * MEDIUM = reframe and emphasize
     * STRONG = rewrite and reposition
     */
    private ChangeIntensity changeIntensity;

    /**
     * Explicitly locked sections that must not be modified.
     * Hard guardrail for planner and builder.
     */
    private List<String> lockedSectionKeys;
}
