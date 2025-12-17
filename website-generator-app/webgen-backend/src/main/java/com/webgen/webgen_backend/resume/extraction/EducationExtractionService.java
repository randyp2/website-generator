package com.webgen.webgen_backend.resume.extraction;

import com.webgen.webgen_backend.model.Education;
import com.webgen.webgen_backend.resume.utils.SectionExtractor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class EducationExtractionService {

    public List<Education> extractEducations(String text) {
        String educationSection = SectionExtractor.extractSection(
                text,
                "EDUCATION|ACADEMIC BACKGROUND|ACADEMIC HISTORY",
                "SKILLS|EXPERIENCE|PROJECTS|CERTIFICATIONS|LEADERSHIP|TECHNICAL SKILLS|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|LEADERSHIP EXPERIENCE"
        );

        List<Education> educations = new ArrayList<>();
        if (educationSection.isBlank()) return educations;

        String[] lines = educationSection.split("\n");

        // Find education boundaries using smarter detection
        List<Integer> boundaryIndices = findEducationBoundaries(lines);

        // Extract education entries
        for (int idx = 0; idx < boundaryIndices.size(); idx++) {
            int startIdx = boundaryIndices.get(idx);
            int endIdx = (idx + 1 < boundaryIndices.size())
                    ? boundaryIndices.get(idx + 1)
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
     * Find boundaries between education entries
     * Key insight: New education starts with "University/College" OR
     * has a graduation date on the same line
     */
    private List<Integer> findEducationBoundaries(String[] lines) {
        List<Integer> boundaries = new ArrayList<>();

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;

            // Check if this is a primary institution (university/college)
            if (isPrimaryInstitution(line)) {
                // Check if previous line is a degree (format: degree comes before institution)
                if (i > 0 && looksLikeDegree(lines[i - 1].trim())) {
                    boundaries.add(i - 1);  // Start from degree line
                } else {
                    boundaries.add(i);  // Start from institution line
                }
            }
        }

        // If no boundaries found, treat first line as boundary
        if (boundaries.isEmpty() && lines.length > 0) {
            for (int i = 0; i < lines.length; i++) {
                if (!lines[i].trim().isEmpty()) {
                    boundaries.add(i);
                    break;
                }
            }
        }

        return boundaries;
    }

    /**
     * Check if line is a PRIMARY institution (university/college level)
     * Not just any "school" (excludes "High School", "Summer School", etc.)
     */
    private boolean isPrimaryInstitution(String line) {
        String lower = line.toLowerCase();

        // Must contain these keywords
        boolean hasInstitutionKeyword =
                lower.contains("university") ||
                        lower.contains("college") ||
                        lower.contains("institute of technology") ||
                        lower.contains("polytechnic");

        if (!hasInstitutionKeyword) return false;

        // Exclude lines that are clearly NOT primary institutions
        if (lower.contains("high school")) return false;
        if (lower.contains("summer school") && !lower.contains("university")) return false;
        if (lower.contains("boot camp") || lower.contains("bootcamp")) return false;

        // Exclude if line starts with "Bachelor", "Master", etc. (degree line, not institution)
        if (lower.startsWith("bachelor") ||
                lower.startsWith("master") ||
                lower.startsWith("associate") ||
                lower.startsWith("b.s.") ||
                lower.startsWith("b.a.") ||
                lower.startsWith("m.s.")) {
            return false;
        }

        return true;
    }

    /**
     * Parse education block
     */
    private void parseEducationBlock(Education education, String block) {
        String[] lines = block.split("\n");
        if (lines.length == 0) return;

        String firstLine = lines[0].trim();

        // Check if first line is a degree (Format: Degree first, then Institution)
        if (looksLikeDegree(firstLine)) {
            // Extract degree and date from first line
            education.setDegree(extractDegreeFromLine(firstLine));

            // Extract date if present
            if (containsEducationDate(firstLine)) {
                extractEducationDates(education, firstLine);
            }

            // Second line should be institution
            if (lines.length > 1) {
                parseInstitutionLine(education, lines[1].trim());
            }

            // Process remaining lines (starting from line 2)
            for (int i = 2; i < lines.length; i++) {
                processEducationLine(education, lines[i].trim());
            }
        }
        // Otherwise, institution is first (original format)
        else {
            parseInstitutionLine(education, firstLine);

            // Process remaining lines (starting from line 1)
            for (int i = 1; i < lines.length; i++) {
                processEducationLine(education, lines[i].trim());
            }
        }
    }

    /**
     * Process a single education line (degree, GPA, dates, awards, coursework)
     */
    private void processEducationLine(Education education, String line) {
        if (line.isEmpty()) return;

        // Extract degree
        if (education.getDegree() == null && looksLikeDegree(line)) {
            education.setDegree(extractDegreeFromLine(line));
        }

        // Extract GPA
        if (education.getGpa() == null && containsGPA(line)) {
            education.setGpa(extractGPA(line));
        }

        // Extract dates
        if (education.getEndDate() == null && containsEducationDate(line)) {
            extractEducationDates(education, line);
        }

        // Extract awards
        if (line.matches("(?i).*(?:scholarship|award|honor|dean).*")) {
            education.setAwards(extractAwards(line));
        }

        // Extract coursework
        if (line.matches("(?i).*(?:relevant coursework|coursework).*")) {
            String coursework = extractCoursework(line);
            if (education.getCourseWork() != null) {
                education.setCourseWork(education.getCourseWork() + " " + coursework);
            } else {
                education.setCourseWork(coursework);
            }
        }
    }

    /**
     * Parse institution line (may contain GPA, location, or dates)
     */
    private void parseInstitutionLine(Education education, String line) {
        // Check if line has "GPA: X.XX" on it
        if (line.contains("GPA") || line.contains("gpa")) {
            // Split at GPA
            int gpaIdx = line.toLowerCase().indexOf("gpa");
            String institutionPart = line.substring(0, gpaIdx).trim();
            String gpaPart = line.substring(gpaIdx).trim();

            // Remove trailing punctuation/location markers
            institutionPart = institutionPart.replaceAll("[,:;]+$", "").trim();

            education.setInstitution(institutionPart);
            education.setGpa(extractGPA(gpaPart));
        }
        // Check if line has graduation date
        else if (containsEducationDate(line)) {
            Pattern datePattern = Pattern.compile(
                    "^(.+?)\\s+(?:Expected|Graduation Date:?)?\\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+(\\d{4})$",
                    Pattern.CASE_INSENSITIVE
            );

            Matcher matcher = datePattern.matcher(line);
            if (matcher.matches()) {
                education.setInstitution(matcher.group(1).trim());
                education.setEndDate(matcher.group(2) + " " + matcher.group(3));
            } else {
                education.setInstitution(line);
            }
        }
        else {
            education.setInstitution(line);
        }
    }

    /**
     * Check if line contains a degree
     */
    private boolean looksLikeDegree(String line) {
        String lower = line.toLowerCase();
        return lower.contains("bachelor") ||
                lower.contains("master") ||
                lower.contains("b.s.") ||
                lower.contains("b.a.") ||
                lower.contains("m.s.") ||
                lower.contains("ph.d") ||
                lower.contains("associate") ||
                lower.contains("diploma") ||
                lower.matches(".*\\b(ba|bs|ma|ms|mba|phd)\\b.*");
    }

    /**
     * Check if line contains GPA
     */
    private boolean containsGPA(String line) {
        return line.matches("(?i).*GPA.*\\d\\.\\d+.*");
    }

    /**
     * Extract degree, removing GPA and dates
     */
    private String extractDegreeFromLine(String line) {
        String cleaned = line
                .replaceAll("(?i)\\(GPA:.*?\\)", "")
                .replaceAll("(?i)GPA:?\\s*\\d\\.\\d+\\s*/\\s*\\d\\.\\d+", "")
                .replaceAll("(?i)Graduation Date:.*", "")
                .replaceAll("(?i)Expected.*\\d{4}", "")
                // ADD THIS: Remove simple "Month YYYY" dates
                .replaceAll("\\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\\s+\\d{4}\\b", "")
                .replaceAll("\\s+", " ")  // Normalize multiple spaces
                .trim();

        return cleaned;
    }

    /**
     * Extract GPA
     */
    private String extractGPA(String line) {
        Pattern gpaPattern = Pattern.compile(
                "(?i)GPA:?\\s*(\\d\\.\\d+)\\s*/\\s*(\\d\\.\\d+)"
        );

        Matcher matcher = gpaPattern.matcher(line);
        if (matcher.find()) {
            return matcher.group(1) + "/" + matcher.group(2);
        }

        // Try without denominator
        Pattern simpleGpaPattern = Pattern.compile("(?i)GPA:?\\s*(\\d\\.\\d+)");
        matcher = simpleGpaPattern.matcher(line);
        if (matcher.find()) {
            return matcher.group(1) + "/4.0";
        }

        return null;
    }

    /**
     * Check if line contains education date
     */
    private boolean containsEducationDate(String line) {
        return line.matches("(?i).*(Expected|Graduation Date:?|Graduated)\\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+\\d{4}.*") ||
                line.matches(".*\\d{2}/\\d{4}\\s*[-–—]\\s*(?:Present|\\d{2}/\\d{4}).*") ||
                line.matches(".*\\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\\s+\\d{4}\\b.*");
    }

    /**
     * Extract dates from line
     */
    private void extractEducationDates(Education education, String line) {
        // Try "May 2027" format (month + year, no "Graduation Date:" prefix)
        Pattern simpleMonthYear = Pattern.compile(
                "\\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\\s+(\\d{4})\\b",
                Pattern.CASE_INSENSITIVE
        );

        Matcher matcher = simpleMonthYear.matcher(line);
        if (matcher.find()) {
            education.setEndDate(matcher.group(1) + " " + matcher.group(2));
            return;
        }

        // Try "Graduation Date: Month YYYY" format
        Pattern graduationPattern = Pattern.compile(
                "(?i)(?:Expected|Graduation Date:?|Graduated)\\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+(\\d{4})"
        );

        matcher = graduationPattern.matcher(line);
        if (matcher.find()) {
            education.setEndDate(matcher.group(1) + " " + matcher.group(2));
            return;
        }

        // Try date range format
        Pattern rangePattern = Pattern.compile(
                "(\\d{2}/\\d{4})\\s*[-–—]\\s*(Present|\\d{2}/\\d{4})"
        );

        matcher = rangePattern.matcher(line);
        if (matcher.find()) {
            education.setStartDate(matcher.group(1));
            education.setEndDate(matcher.group(2));
        }
    }

    /**
     * Extract awards
     */
    private String extractAwards(String line) {
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