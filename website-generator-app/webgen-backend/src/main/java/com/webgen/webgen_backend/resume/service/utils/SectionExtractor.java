package com.webgen.webgen_backend.resume.service.utils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

// Used to extract sections of a pdf
public class SectionExtractor {

    private SectionExtractor() {}; // Default constructor


    /**
     * Extracts subsection of the resume by header name
     * Performs structural slicing
     *
     * @param text - Normalized resume text
     * @param startHeaderRegex - Section header to locate beginning of subsection
     * @param endHeadersRegex - Regex of headers marking end of the section
     *                          All possible headers that may come next
     * @return Text of the subportion of the resume
     */
    public static String extractSection(
            String text,
            String startHeaderRegex,
            String endHeadersRegex) {
        try {

            // Find the start header
            //  - must start on new line or beginning of document
            Pattern startPattern = Pattern.compile(
                    "(?:^|\\n)\\s*(" + startHeaderRegex + ")\\s*(?:\\n|$)",
                    Pattern.CASE_INSENSITIVE
            );

            Matcher startMatcher = startPattern.matcher(text);
            if (!startMatcher.find())
                return ""; // Section not found


            int contentStart = startMatcher.end();

            // Find the end header
            Pattern endPattern = Pattern.compile(
                    "(?:^|\\n)\\s*(" + endHeadersRegex + ")\\s*(?:\\n|$)",
                    Pattern.CASE_INSENSITIVE
            );

            Matcher endMatcher = endPattern.matcher(text);
            int contentEnd;

            if (endMatcher.find(contentStart)) {
                contentEnd = endMatcher.start();
            } else {
                contentEnd = text.length(); // Section goes to end of text
            }

            String content = text.substring(contentStart, contentEnd).trim();
            return content;

        } catch (Exception e) {
            return "";
        }
    }

}
