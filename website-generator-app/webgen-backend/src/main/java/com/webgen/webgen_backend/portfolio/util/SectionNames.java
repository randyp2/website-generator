package com.webgen.webgen_backend.portfolio.util;

/**
 * Naming helpers for portfolio section keys.
 */
public final class SectionNames {

    private SectionNames() {
    }

    /**
     * Converts a hyphenated sectionKey into PascalCase for the React component
     * function name. Example: "work-experience" becomes "WorkExperience",
     * used as "WorkExperienceSection".
     *
     * @param sectionKey lowercase, optionally hyphenated section identifier
     * @return PascalCase name, or "Unknown" when the key is null or blank
     */
    public static String toPascalCase(String sectionKey) {
        if (sectionKey == null || sectionKey.isBlank())
            return "Unknown";
        StringBuilder sb = new StringBuilder();
        for (String part : sectionKey.split("-")) {
            if (!part.isEmpty()) {
                sb.append(Character.toUpperCase(part.charAt(0)));
                if (part.length() > 1)
                    sb.append(part.substring(1));
            }
        }
        return sb.toString();
    }
}
