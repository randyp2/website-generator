package com.webgen.webgen_backend.resume_service.extraction;


import com.webgen.webgen_backend.model.ParsedResume;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ContactInfoExtractionService {

    // Regex patterns
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b"
    );

    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}"
    );

    // Matches: "City, ST" or "City Name, ST" or "City, State"
    private static final Pattern LOCATION_PATTERN = Pattern.compile(
            "\\b([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*),\\s*([A-Z]{2}|[A-Z][a-z]+)\\b"
    );

    public void extractContactInfo(ParsedResume resume, String normalizedText) {
        if (normalizedText == null || normalizedText.isBlank()) return;

        String[] lines = normalizedText.split("\n");

        // Extract structured contact fields before extracting name
        resume.setEmail(extractEmail(normalizedText));
        resume.setPhone(extractPhone(normalizedText));
        resume.setLocation(extractLocation(normalizedText));

        // Extract name
        resume.setFullName(extractName(lines, normalizedText));
    }

    /**
     * Extract the full name of the user's resume
     * Typically located at:
     *  - First line
     *  - Before contact, email, phone, location
     * @param normalizedText - normalized test of resume
     * @return - Name of the user's resume
     */
    private String extractName(String[] lines, String normalizedText) {

        // Get first non-empty line
        for (String line : lines) {
            String cleaned = cleanLine(line);
            if (!cleaned.isEmpty()) {
                return extractNameFromFirstLine(cleaned);
            }
        }

        return null;
    }

    /**
     * Extract the full name in the first line of the resume
     *
     * @param line - First line in resume
     * @return - Full name of user's resume
     */
    private String extractNameFromFirstLine(String line) {
        System.out.println("ATTEMPTING TO EXTRACT FIRST NAME FROM : " + line);
        if (line == null || line.isBlank()) return null;

        // Remove header elements
        String cleaned = line
                .replaceAll("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b", "") // emails
                .replaceAll("\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}", "")              // phones
                .replaceAll("\\|", " ")                                                     // separators
                .replaceAll("#", "")                                                        // symbols
                .replaceAll("(?i)linkedin\\.com/[\\w-]+", "")                              // LinkedIn
                .replaceAll("(?i)github\\.com/[\\w-]+", "")                                // GitHub
                .replaceAll("[^a-zA-Z\\s'-]", " ")  // ← Keep hyphens and apostrophes
                .replaceAll("\\s+", " ")                                                   // collapse spaces
                .trim();

        // Validate: must have at least 2 chars and ideally have a space (for first + last name)
        if (!cleaned.isBlank() && cleaned.length() >= 2 && cleaned.length() <= 50) {
            return cleaned;
        }

        return null;  // If cleaning completely fails, return null
    }

    /**
     * Find position of first match or -1 if not found
     */
    private int findPosition(String normalizedText, Pattern pattern) {
        Matcher matcher = pattern.matcher(normalizedText);
        return matcher.find() ? matcher.start() : -1;
    }

    /**
     * Extract location
     */
    private String extractLocation(String normalizedText) {
        Matcher matcher = LOCATION_PATTERN.matcher(normalizedText);

        if (!matcher.find()) return "";


        // Search in the first 5 lines for location and grab first instance
        // Location can appear in multiple places
        // i.e. experiences, education so on
        String[] lines = normalizedText.split("\n");
        for (int i = 0; i < Math.min(5, lines.length); ++i) {
            Matcher lineMatcher = LOCATION_PATTERN.matcher(lines[i]);

            if (lineMatcher.find()) return lineMatcher.group().trim();
        }

        return null;
    }

    /**
     * Extract phone number
     */
    private String extractPhone(String normalizedText) {
        Matcher matcher = PHONE_PATTERN.matcher(normalizedText);

        if (!matcher.find()) return null;


        // Replace non-digit chars with empty string
        String phoneNumber = matcher.group().replaceAll("\\D", "");
        return formatPhoneNumber(phoneNumber);
    }

    /**
     * Format phone to: (xxx) xxx-xxxx
     */
    private String formatPhoneNumber(String digits) {
        if (digits.length() == 10) {
            return String.format("(%s) %s-%s",
                    digits.substring(0,3),
                    digits.substring(3,6),
                    digits.substring(6,10));
        }

        return digits; // Return as is if more numbers exist
    }


    /**
     * Extract the email portion
     */
    private String extractEmail(String normalizedText) {
        Matcher matcher = EMAIL_PATTERN.matcher(normalizedText);

        return matcher.find() ? matcher.group() : null;

    }

    /**
     * Clean line - remove weird Unicode characters
     */
    private String cleanLine(String str) {
        if (str == null) return "";

        // Remove bullet character U+F0A7 (decimal 61623)
        str = str.replace('\uF0A7', ' ');

        // Remove other Private Use Area characters
        str = str.replaceAll("[\uE000-\uF8FF]", " ");

        // Remove ALL Unicode whitespace
        str = str.replaceAll("^\\s+|\\s+$", "");

        return str;
    }


}

