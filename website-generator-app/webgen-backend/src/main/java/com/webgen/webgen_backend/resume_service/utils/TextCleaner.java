package com.webgen.webgen_backend.resume_service.utils;

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

            // 1. Normalize line endings (Windows, Mac, Linux)
            text = text.replace("\r\n", "\n")
                    .replace("\r", "\n");

            // 2. Replace bullet characters with standard dash ONLY at start of lines
            text = text.replaceAll("(?m)^\\s*[•●▪◦■▸►★✓✔⦿◉]\\s*", "- ");

            // 3. Handle bullets after newlines (mid-text)
            text = text.replaceAll("(?m)\n\\s*[•●▪◦■▸►★✓✔⦿◉]\\s*", "\n- ");

            // 4. Collapse multiple spaces into one (but preserve single spaces)
            text = text.replaceAll("[ \\t]+", " ");

            // 5. Remove spaces at end of lines
            text = text.replaceAll(" +\n", "\n");

            // 6. Collapse multiple newlines into max two
            text = text.replaceAll("\n{3,}", "\n\n");

            // 7. Trim leading/trailing whitespace
            return text.trim();
        }
}
