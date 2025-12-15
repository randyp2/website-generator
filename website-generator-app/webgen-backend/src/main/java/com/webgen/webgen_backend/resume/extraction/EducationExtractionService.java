package com.webgen.webgen_backend.resume.extraction;

import com.webgen.webgen_backend.model.Education;
import com.webgen.webgen_backend.resume.utils.SectionExtractor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/* ====================================================================================*/
// Service class that helps extract education fields and metadata within those subsections
/* ====================================================================================*/

@Service
public class EducationExtractionService {

    /**
     * Extract the education section and return extracted data and metdata
     *
     * @param text - Normalized text of entire resume
     * @return list of parsed education classes
     */
    public List<Education> extractEducations(String text) {

        // Extract education section
        String educationSection = SectionExtractor.extractSection(
                text,
                "EDUCATION|ACADEMIC BACKGROUND|ACADEMIC HISTORY",
                "SKILLS|EXPERIENCE|PROJECTS|CERTIFICATIONS|LEADERSHIP|TECHNICAL SKILLS|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE"
        );

        List<Education> educations = new ArrayList<>();
        if (educationSection.isBlank()) return educations;

        // Parse into lines
        String[] lines = educationSection.split("\n");

        // Find education boundaries - only institution lines start new entries
        List<Integer> boundaryStartIndices = new ArrayList<>();

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;

            // New education entry starts ONLY if:
            // 1. Contains institution keyword AND doesn't look like a degree/coursework/award line
            // 2. Is the first non-empty line (edge case)
            if (looksLikeInstitution(line) && !looksLikeDegree(line) && !line.matches("(?i).*(?:coursework|award|scholarship).*")) {
                boundaryStartIndices.add(i);
            }
        }

        // If no institution found but section exists, treat as single entry
        if (boundaryStartIndices.isEmpty() && lines.length > 0) {
            for (int i = 0; i < lines.length; i++) {
                if (!lines[i].trim().isEmpty()) {
                    boundaryStartIndices.add(i);
                    break;
                }
            }
        }

        // Extract education entries using boundaries
        for (int idx = 0; idx < boundaryStartIndices.size(); idx++) {
            int startIdx = boundaryStartIndices.get(idx);
            int endIdx = (idx + 1 < boundaryStartIndices.size())
                    ? boundaryStartIndices.get(idx + 1)
                    : lines.length;

            StringBuilder rawBlock = new StringBuilder();

            for (int i = startIdx; i < endIdx; i++) {
                String line = lines[i].trim();
                if (line.isEmpty()) continue;
                rawBlock.append(line).append("\n");
            }

            if (rawBlock.length() == 0) continue;

            Education edu = new Education();
            parseEducationBlock(edu, rawBlock.toString().trim());
            educations.add(edu);
        }

        return educations;
    }

    /**
     * Check if line looks like a degree (not an institution)
     */
    private boolean looksLikeDegree(String line) {
        String lower = line.toLowerCase();
        return (lower.contains("bachelor") ||
                lower.contains("master") ||
                lower.contains("b.s.") ||
                lower.contains("b.a.") ||
                lower.contains("m.s.") ||
                lower.contains("ph.d") ||
                lower.contains("associate") ||
                lower.contains("degree") ||
                lower.contains("bootcamp")) &&
                !looksLikeInstitution(line);  // Make sure it's not both
    }

    /**
     * Check if line looks like an institution name
     */
    private boolean looksLikeInstitution(String line) {
        String lowerLine = line.toLowerCase();
        return lowerLine.contains("university") ||
                lowerLine.contains("college") ||
                lowerLine.contains("institute") ||
                lowerLine.contains("school") ||
                lowerLine.contains("academy") ||
                lowerLine.contains("bootcamp");
    }

    /**
     * Check if line contains education-specific dates
     */
    private boolean containsEducationDate(String line) {
        // Expected May 2027, Graduated Dec 2024, 01/2023 - Present, etc.
        return line.matches(".*(?:Expected|Graduated|Attending)\\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+\\d{4}.*") ||
                line.matches(".*\\d{2}/\\d{4}\\s*[-–—]\\s*(?:Present|\\d{2}/\\d{4}).*");
    }

    /**
     * Parse a complete education block
     *  - Initialize properties of educations
     *
     * @param education - Education class to populate
     * @param block - Education sectino block
     */
    private void parseEducationBlock(Education education, String block) {
        String[] lines = block.split("\n");

        if (lines.length == 0) return;

        // First line is the institution (may have date on same line)
        String firstLine = lines[0].trim();

        // Check if institution + date on same line (Randy's format)
        Pattern institutionDatePattern = Pattern.compile(
                "^(.+?)\\s+(?:Expected|Graduated)?\\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+(\\d{4})$",
                Pattern.CASE_INSENSITIVE
        );

        Matcher matcher = institutionDatePattern.matcher(firstLine);
        if (matcher.matches()) {
            // Randy's format: "University of Nevada, Las Vegas Expected May 2027"
            education.setInstitution(matcher.group(1).trim());
            education.setEndDate(matcher.group(2) + " " + matcher.group(3));
        } else {
            // Ruben's format: "University of Nevada Las Vegas" (no date)
            education.setInstitution(firstLine);
        }

        // Process remaining lines
        for (int i = 1; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;

            // Extract degree (look for degree keywords)
            if (education.getDegree() == null && looksLikeDegree(line)) {
                education.setDegree(extractDegreeFromLine(line));
            }

            // Extract GPA
            if (line.contains("GPA") || line.matches(".*\\(GPA:.*\\).*")) {
                String gpa = extractGPA(line);
                if (gpa != null) {
                    education.setGpa(gpa);
                }
            }

            // Extract end date if not already set
            if (education.getEndDate() == null && containsEducationDate(line)) {
                extractEducationDates(education, line);
            }

            // Extract awards/scholarships
            if (line.matches("(?i).*(?:scholarship|award|honor|dean).*")) {
                String awards = extractAwards(line);
                if (awards != null && !awards.isEmpty()) {
                    education.setAwards(awards);
                }
            }

            // Extract coursework
            if (line.matches("(?i).*(?:relevant coursework|coursework).*")) {
                String coursework = extractCoursework(line);
                // Append to existing coursework if already set
                if (education.getCourseWork() != null) {
                    education.setCourseWork(education.getCourseWork() + " " + coursework);
                } else {
                    education.setCourseWork(coursework);
                }
            } else if (education.getCourseWork() != null && !line.matches("(?i).*(scholarship|award|gpa).*")) {
                // Continuation of coursework if coursework was already started and this isn't another field
                education.setCourseWork(education.getCourseWork() + " " + line);
            }
        }
    }

    /**
     * Extract degree from a line, removing date/GPA info
     */
    private String extractDegreeFromLine(String line) {
        // Remove GPA portion if present
        String cleaned = line.replaceAll("(?i)\\(GPA:.*?\\)", "").trim();

        // Remove date portion if present
        cleaned = cleaned.replaceAll("(?i)Expected.*\\d{4}", "").trim();
        cleaned = cleaned.replaceAll("(?i)Graduated.*\\d{4}", "").trim();

        return cleaned;
    }


    /**
     * Extract GPA
     */
    private String extractGPA(String line) {
        // Match patterns like "GPA: 4.00 / 4.00", "(GPA: 3.4/4.0)", "3.4/4.0"
        Pattern gpaPattern = Pattern.compile(
                "(?:GPA:?)?\\s*(\\d\\.\\d+)\\s*/\\s*(\\d\\.\\d+)",
                Pattern.CASE_INSENSITIVE
        );

        Matcher matcher = gpaPattern.matcher(line);
        if (matcher.find()) {
            return matcher.group(1) + "/" + matcher.group(2);
        }

        return null;
    }

    /**
     * Extract education dates
     */
    private void extractEducationDates(Education education, String line) {
        // Pattern: "Expected May 2027", "01/2023 - Present", etc.

        // Try month-year format first
        Pattern monthYearPattern = Pattern.compile(
                "(?:Expected|Graduated)?\\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+(\\d{4})",
                Pattern.CASE_INSENSITIVE
        );

        Matcher matcher = monthYearPattern.matcher(line);
        if (matcher.find()) {
            education.setEndDate(matcher.group(1) + " " + matcher.group(2));
            return;
        }

        // Try numeric date range format
        Pattern rangePattern = Pattern.compile(
                "(\\d{2}/\\d{4})\\s*[-–—]\\s*(Present|\\d{2}/\\d{4})"
        );

        matcher = rangePattern.matcher(line);
        if (matcher.find()) {
            education.setStartDate(matcher.group(1)); // Note: typo in model "startDatae"
            education.setEndDate(matcher.group(2));
        }
    }

    /**
     * Extract awards and scholarships
     */
    private String extractAwards(String line) {
        // Remove the prefix "Scholarships & Awards:", "Awards:", etc.
        Pattern pattern = Pattern.compile(
                "(?i)(?:scholarships?\\s*&?\\s*awards?|awards?|honors?):?\\s*(.+)",
                Pattern.CASE_INSENSITIVE
        );

        Matcher matcher = pattern.matcher(line);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        return line.trim();
    }

    /**
     * Extract relevant coursework
     */
    private String extractCoursework(String line) {
        // Remove the prefix "Relevant Coursework:", "Coursework:", etc.
        Pattern pattern = Pattern.compile(
                "(?i)(?:relevant\\s+)?coursework:?\\s*(.+)",
                Pattern.CASE_INSENSITIVE
        );

        Matcher matcher = pattern.matcher(line);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        return line.trim();
    }


}
