package com.webgen.webgen_backend.resume.service.extraction;

import com.webgen.webgen_backend.resume.service.utils.SectionExtractor;
import org.springframework.stereotype.Service;

@Service
public class SummaryExtractionService {

    private final int MAX_SUMMARY_LENGTH = 300; // chars
    private final int MIN_SUMMARY_LENGTH = 20; // chars

    /**
     * Extract professional summary/about section
     *
     * @param text normalized resume text
     * @return cleaned summary text, or empty string if not found
     */
    public String extract(String text) {
        String summarySection = SectionExtractor.extractSection(
                text,
                "SUMMARY|ABOUT ME|PROFESSIONAL SUMMARY|PROFILE|OBJECTIVE|ABOUT",
                "SKILLS|EDUCATION|EXPERIENCE|CERTIFICATIONS|LEADERSHIP|TECHNICAL SKILLS"
        );

        if (summarySection.isBlank()) return "";
        
        if (summarySection.length() < MIN_SUMMARY_LENGTH) return "";
        if(summarySection.length() > MAX_SUMMARY_LENGTH) 
            return truncateAtSentence(summarySection);

        return summarySection;

    }


    /**
     * Truncate text at last complete sentence before the maxlength
     */
    private String truncateAtSentence(String summarySection) {
        String truncated = summarySection.substring(0, MAX_SUMMARY_LENGTH);

        // Find last sentence with punctuation
        int lastPeriod = truncated.lastIndexOf('.');

        // IF found truncate
        if (lastPeriod > MAX_SUMMARY_LENGTH / 2) // Ensure not truncating too much
            return truncated.substring(0, lastPeriod + 1).trim();

        int lastSpace = truncated.lastIndexOf(' ');
        if (lastSpace > 0) return truncated.substring(0, lastSpace).trim() + "...";

        return truncated.trim() + "...";

    }
}
