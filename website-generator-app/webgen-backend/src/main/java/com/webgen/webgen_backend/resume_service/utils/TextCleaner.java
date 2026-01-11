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
            debugText(rawText.substring(0, Math.min(2000, rawText.length())));
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

        /**
         * DEBUG: Print text with character codes to see what bullets actually are
         */
        private void debugText(String sample) {
            System.out.println("\n=== RAW TEXT DEBUG ===");
            String[] lines = sample.split("\n");

            for (int i = 0; i < Math.min(20, lines.length); i++) {
                String line = lines[i];
                if (line.trim().isEmpty()) continue;

                // Print the line
                System.out.println("Line " + i + ": " + line);

                // Check first character
                if (!line.isEmpty()) {
                    char firstChar = line.trim().charAt(0);
                    System.out.printf("  First char: '%c' (U+%04X) (decimal: %d)\n",
                            firstChar, (int) firstChar, (int) firstChar);
                }
            }
            System.out.println("===================\n");
        }
}
