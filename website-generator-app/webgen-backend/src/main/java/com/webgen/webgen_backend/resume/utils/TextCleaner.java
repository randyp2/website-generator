package com.webgen.webgen_backend.resume.utils;

import org.springframework.stereotype.Component;

@Component
public class TextCleaner {

    /**
     * Normalize raw resume text
     *  - Removing weird spaces
     *  - Normalizing bullet points
     *  - Normalizing indentation
     */
    public String clean(String rawText) {
        if (rawText == null || rawText.isBlank()) return "";

        String text = rawText;
        // Normalize line endings (Windows, Mac, Linux)
        text = text.replace("\r\n", "\n")
                .replace("\r", "\n");

        // Replace bullet characters with a standard dash
        text = text.replaceAll("[•●▪◦]", "-");

        // Collapse multiple spaces into one
        text = text.replaceAll("[ \t]+", " ");

        // Collapse multiple newlines into max two
        text = text.replaceAll("\n{3,}", "\n\n");

        // Trim leading/trailing whitespace
        return text.trim();
    }
}
