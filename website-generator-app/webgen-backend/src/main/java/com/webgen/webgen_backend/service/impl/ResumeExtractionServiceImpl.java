package com.webgen.webgen_backend.service.impl;

import com.webgen.webgen_backend.mapper.ParsedResumeMapper;
import com.webgen.webgen_backend.model.Education;
import com.webgen.webgen_backend.model.Experience;
import com.webgen.webgen_backend.model.ParsedResume;
import com.webgen.webgen_backend.model.Project;
import com.webgen.webgen_backend.service.ResumeExtractionService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ResumeExtractionServiceImpl implements ResumeExtractionService {

    @Override
    public ParsedResume extract(String normalizedText) {

        ParsedResume parsedResume = new ParsedResume(); // To populate

        // Store normalized text
        parsedResume.setNormalizedText(normalizedText);

        parsedResume.setSkills(extractSkills(normalizedText));
        parsedResume.setExperiences(extractExperience(normalizedText));

        parsedResume.setProjects(extractProjects(normalizedText));
        parsedResume.setEducations(extractEducations(normalizedText));

        return parsedResume;
    }


    private List<Education> extractEducations(String text) {
        String educationSection = extractSection(
                text,
                "EDUCATION|ACADEMIC BACKGROUND|ACADEMIC HISTORY",
                "SKILLS|EXPERIENCE|PROJECTS|CERTIFICATIONS|LEADERSHIP|TECHNICAL SKILLS|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE"
        );

        List<Education> educations = new ArrayList<>();
        if (educationSection.isBlank()) return educations;

        String[] lines = educationSection.split("\n");

        // Find education boundaries - only institution lines start new entries
        List<Integer> boundaryIndices = new ArrayList<>();

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;

            // New education entry starts ONLY if:
            // 1. Contains institution keyword AND doesn't look like a degree/coursework/award line
            // 2. Is the first non-empty line (edge case)
            if (looksLikeInstitution(line) && !looksLikeDegree(line) && !line.matches("(?i).*(?:coursework|award|scholarship).*")) {
                boundaryIndices.add(i);
            }
        }

        // If no institution found but section exists, treat as single entry
        if (boundaryIndices.isEmpty() && lines.length > 0) {
            for (int i = 0; i < lines.length; i++) {
                if (!lines[i].trim().isEmpty()) {
                    boundaryIndices.add(i);
                    break;
                }
            }
        }

        // Extract education entries using boundaries
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
     * Check if line contains a degree
     */
    private boolean containsDegree(String line) {
        String lower = line.toLowerCase();
        return lower.contains("bachelor") ||
                lower.contains("master") ||
                lower.contains("b.s.") ||
                lower.contains("b.a.") ||
                lower.contains("m.s.") ||
                lower.contains("ph.d") ||
                lower.contains("associate") ||
                lower.contains("bootcamp");
    }

    /**
     * Extract degree information
     */
    private String extractDegree(String line) {
        // Try to extract everything before a date or location
        Pattern degreePattern = Pattern.compile(
                "^(.+?)(?:\\s+(?:Expected|Graduated|GPA:|\\(GPA).*|$)",
                Pattern.CASE_INSENSITIVE
        );

        Matcher matcher = degreePattern.matcher(line);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        return line.trim();
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

    /**
     * Extract skills form the SKILLS section of the resume
     *
     * @param text - normalized resume text
     * @return list of skill strings (empty if none exist)
     */
    private List<String> extractSkills(String text) {
        String skillsSection = extractSection(
                text,
                "SKILLS|TECHNICAL SKILLS|TECHNOLOGIES|COMPETENCIES",  // Add variations
                "EXPERIENCE|EDUCATION|PROJECTS|CERTIFICATIONS|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE"
        );

        List<String> skills = new ArrayList<>(); // Store skills section in list

        if (skillsSection.isBlank()) return skills; // Return empty list

        /**
         * Tokenize skills section based on delimiter
         *  - Commas
         *  - New lines
         *  - Bullet points (we converted to dashes)
         *  - Semicolons
         */
        String[] tokens = skillsSection.split("[,\n;-]");

        // Store skills in list
        for (String token : tokens) {
            if(token.isEmpty()) continue;
            if (token.length() < 2) continue;

            skills.add(token.trim());
        }

        return skills;
    }

    /**
     * Extract projects and all metadata attached to them
     *
     * @param text - normalized resume text
     * @return list of projects
     */
    private List<Project> extractProjects(String text) {
        String projectSection = extractSection(
                text,
                "PROJECTS|PERSONAL PROJECTS|SIDE PROJECTS",
                "SKILLS|EDUCATION|EXPERIENCE|CERTIFICATIONS|LEADERSHIP|TECHNICAL SKILLS"
        );

        List<Project> projects = new ArrayList<>();

//        System.out.println("===== RAW PROJECT SECTION =====");
//        System.out.println(projectSection);
//        System.out.println("================================");

        if (projectSection.isBlank()) {
//            System.out.println("Project section is blank");
            return projects;
        }

        String[] lines = projectSection.split("\n");

        // Two-pass approach: find project boundaries first
        List<Integer> projectStarts = new ArrayList<>();

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;

            // A project header is:
            // 1. Not a bullet point
            // 2. Relatively short (< 100 chars)
            // 3. Has bullets within the next 3 lines
            if (!line.startsWith("-") && line.length() < 100) {
                // Look ahead for bullets within next 3 lines
                boolean hasBulletsNearby = false;
                for (int j = i + 1; j < Math.min(i + 4, lines.length); j++) {
                    String nextLine = lines[j].trim();
                    if (!nextLine.isEmpty() && nextLine.startsWith("-")) {
                        hasBulletsNearby = true;
                        break;
                    }
                }

                if (hasBulletsNearby) {
                    projectStarts.add(i);
                }
            }
        }

        // Extract projects using boundaries
        for (int idx = 0; idx < projectStarts.size(); idx++) {
            int startIdx = projectStarts.get(idx);
            int endIdx = (idx + 1 < projectStarts.size())
                    ? projectStarts.get(idx + 1)
                    : lines.length;

            StringBuilder rawBlock = new StringBuilder();

            for (int i = startIdx; i < endIdx; i++) {
                String line = lines[i].trim();
                if (line.isEmpty()) continue;
                rawBlock.append(line).append("\n");
            }

            if (rawBlock.isEmpty()) continue;

            Project project = new Project();
            project.setRawBlock(rawBlock.toString().trim());
            parseProjectContent(project);
            projects.add(project);
        }

        return projects;
    }

    private void parseProjectContent(Project project) {
        String[] lines = project.getRawBlock().split("\n");
        if (lines.length == 0) return;

        // Find where bullets start
        int bulletStartIdx = -1;
        for (int i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith("-")) {
                bulletStartIdx = i;
                break;
            }
        }

        // Everything before bullets is the header (may be multi-line)
        StringBuilder header = new StringBuilder();
        int headerEndIdx = (bulletStartIdx != -1) ? bulletStartIdx : lines.length;

        for (int i = 0; i < headerEndIdx; i++) {
            if (i > 0) header.append(" ");  // Join multi-line headers with space
            header.append(lines[i].trim());
        }

        project.setHeader(header.toString().trim());

        // Parse bullets if they exist
        if (bulletStartIdx != -1) {
            parseProjectBullets(project, bulletStartIdx);
        }
    }

    private void parseProjectBullets(Project project, int startIdx) {
        String[] lines = project.getRawBlock().split("\n");
        List<String> bullets = new ArrayList<>();

        StringBuilder currentBullet = null;
        for (int i = startIdx; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;

            if (line.startsWith("-")) {
                // Save previous bullet
                if (currentBullet != null) {
                    bullets.add(currentBullet.toString().trim());
                }

                // Start new bullet
                currentBullet = new StringBuilder();
                currentBullet.append(line.substring(1).trim());
            } else if (currentBullet != null) {
                // Continuation of current bullet
                currentBullet.append(" ").append(line);
            }
        }

        // Don't forget last bullet
        if (currentBullet != null) {
            bullets.add(currentBullet.toString().trim());
        }

        project.setBullets(bullets);
    }



    private boolean looksLikeHeader(String line) {
        // Potential header if its short and doesnt end with a period
        return line.length() < 90 && !line.endsWith(".");
    }

    private void parseProjectHeader(Project project) {
        String[] lines = project.getRawBlock().split("\n");

        if (lines.length == 0) return;

        // First line in project block is header
        project.setHeader(lines[0].trim());
    }

    private void parseProjectBullets(Project project) {
        String[] lines = project.getRawBlock().split("\n");

        if (lines.length < 1) return;

        // Skip non bulleted lines
        int startIdx = 1;
        while (startIdx < lines.length
                && (lines[startIdx].isBlank() || lines[startIdx].charAt(0) != '-'))
            ++startIdx;

        if (startIdx == lines.length) return; // No bullet points

        List<String> bullets = new ArrayList<>();

        StringBuilder currentBullet = null;
        for (int i = startIdx; i < lines.length; ++i) {

            String line = lines[i].trim();
            if (line.isEmpty()) continue;

            if (line.startsWith("-")) { // Ending of bullet start of next bullet

                // Save the previous bullet point
                if (currentBullet != null)
                    bullets.add(currentBullet.toString().trim());

                // Reset stringbuilder
                currentBullet = new StringBuilder();
                currentBullet.append(line.substring(1).trim()); // Exclude dash

            } else  if (currentBullet != null) { // Data of current bullet
                currentBullet.append(" ").append(line);
            }

        }

        // Add final bullet
        if (currentBullet != null)
            bullets.add(currentBullet.toString().trim());

        project.setBullets(bullets);

    }


    /**
     * Extract work experiences by locating the work experience subsection and grabbing
     * everything in between.
     *
     * @param text - normalized resume text
     * @return list of experiences on the subsection the experiences resume
     */
    private List<Experience> extractExperience(String text) {

        String experienceSection = extractSection(
                text,
                "EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT",  // Add variations
                "SKILLS|EDUCATION|PROJECTS|CERTIFICATIONS|LEADERSHIP|TECHNICAL SKILLS"
        );


        List<Experience> experiences = new ArrayList<>();
        if (experienceSection.isBlank()) return experiences;

        String[] lines = experienceSection.split("\n");

        // First pass: find all experience boundary indices
        List<Integer> boundaryIndices = new ArrayList<>();

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;

            boolean currentHasDate = containsDateRange(line);
            String nextLine = (i + 1 < lines.length) ? lines[i + 1].trim() : "";
            boolean nextHasDate = !nextLine.isEmpty() && containsDateRange(nextLine);

            // This is a boundary if current or next has date
            if (currentHasDate || nextHasDate) {
                boundaryIndices.add(i);

                // If next has date, skip it in the next iteration
                if (nextHasDate && !currentHasDate) {
                    i++; // Jump over the date line
                }
            }
        }

        // Second pass: extract experiences using boundaries
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

            Experience exp = new Experience();
            exp.setRawBlock(rawBlock.toString().trim());
            parseExperienceBlock(exp);
            experiences.add(exp);
        }

        return experiences;
    }
    /**
     * Parse the complete experience block - handles multiple formats
     * Format 1: Company + Date on line 1, Role + Location on line 2
     * Format 2: Company on line 1, Role + Date on line 2
     */
    private void parseExperienceBlock(Experience experience) {
        String[] lines = experience.getRawBlock().split("\n");
        if (lines.length == 0) return;

        // Find which line has the date
        int dateLineIdx = findDateLine(lines);
        if (dateLineIdx == -1) return; // No date found, invalid experience

        if (dateLineIdx == 0) {
            String firstLine = lines[0];

            // Check if it has a comma (Format 3: "Title, Company Date")
            if (firstLine.contains(",")) {
                parseTitleCommaCompanyAndDate(experience, firstLine);
            } else {
                // Format 1: "Company Date"
                parseCompanyAndDate(experience, firstLine);

                if (lines.length > 1) {
                    parseRoleAndLocation(experience, lines[1]);
                }
            }

            // Bullets start at line 1 (or 2 if there's a role line)
            parseExperienceBullets(experience, 1);

        } else if (dateLineIdx == 1) {
            // Format 2: Company on line 0, "Title Date" on line 1
            experience.setCompany(lines[0].trim());
            parseRoleAndDate(experience, lines[1]);

            // Bullets start at line 2
            parseExperienceBullets(experience, 2);
        }
    }

    /**
     * Parse title, company, and date from single line with comma
     * Format: "Full Stack Developer, LOUD 05/2023 – 07/2024"
     */
    private void parseTitleCommaCompanyAndDate(Experience experience, String line) {
        // First, extract the date
        Pattern datePattern = Pattern.compile(
                "(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\\d{2})/?" +  // Month (name or number)
                        "(\\d{4})\\s*[-–—]\\s*" +                                         // Start year
                        "(Present|\\d{2}/\\d{4}|\\d{4})",                                 // End date
                Pattern.CASE_INSENSITIVE
        );

        Matcher dateMatcher = datePattern.matcher(line);
        if (dateMatcher.find()) {
            String startMonth = dateMatcher.group(1);
            String startYear = dateMatcher.group(2);
            String endDate = dateMatcher.group(3);

            experience.setStartDate(startMonth + "-" + startYear);
            experience.setEndDate(endDate);

            // Everything before the date
            String beforeDate = line.substring(0, dateMatcher.start()).trim();

            // Split on the last comma to separate title from company
            int lastCommaIdx = beforeDate.lastIndexOf(',');
            if (lastCommaIdx != -1) {
                String title = beforeDate.substring(0, lastCommaIdx).trim();
                String company = beforeDate.substring(lastCommaIdx + 1).trim();

                experience.setTitle(title);
                experience.setCompany(company);
            } else {
                // No comma found, treat entire thing as title
                experience.setTitle(beforeDate);
            }
        }
    }


    /**
     * Find which line (0-2) contains a date range
     */
    private int findDateLine(String[] lines) {
        for (int i = 0; i < Math.min(3, lines.length); i++) {
            if (containsDateRange(lines[i])) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Parse company name and date from same line
     * Format: "CRJ Services Sep 2025 – Present"
     */
    private void parseCompanyAndDate(Experience experience, String line) {
        Pattern pattern = Pattern.compile(
                "^(.+?)\\s+" +                                              // Company name (lazy)
                        "(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+" +  // Start month
                        "(\\d{4})\\s*[-–—]\\s*" +                                   // Start year + separator
                        "(Present|\\d{4})$",                                        // End date
                Pattern.CASE_INSENSITIVE
        );

        Matcher matcher = pattern.matcher(line);
        if (matcher.matches()) {
            experience.setCompany(matcher.group(1).trim());
            experience.setStartDate(matcher.group(2).trim() + "-" + matcher.group(3).trim());
            experience.setEndDate(matcher.group(4).trim());
        }
    }

    /**
     * Parse role/title and date from same line
     * Format: "Founder, President & Lead Full-Stack Developer May 2025– Present"
     */
    private void parseRoleAndDate(Experience experience, String line) {
        Pattern datePattern = Pattern.compile(
                "(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+" +  // Start month
                        "(\\d{4})\\s*[-–—]\\s*" +                                   // Start year
                        "(Present|\\d{4})",                                         // End date
                Pattern.CASE_INSENSITIVE
        );

        Matcher matcher = datePattern.matcher(line);
        if (matcher.find()) {
            // Extract dates
            experience.setStartDate(matcher.group(1) + "-" + matcher.group(2));
            experience.setEndDate(matcher.group(3));

            // Everything before the date is the title
            String title = line.substring(0, matcher.start()).trim();
            experience.setTitle(title);
        }
    }

    /**
     * Parse role and location from a line (no date)
     * Format: "Lead Full-Stack Developer Las Vegas, NV"
     */
    private void parseRoleAndLocation(Experience experience, String line) {
        // Pattern to match: "Title City, ST" or "Title City Name, ST"
        Pattern locationPattern = Pattern.compile(
                "^(.+?)\\s+([A-Za-z][A-Za-z\\s]+,\\s*[A-Z]{2})\\s*$"
        );

        Matcher matcher = locationPattern.matcher(line);

        if (matcher.matches()) {
            experience.setTitle(matcher.group(1).trim());
            experience.setLocation(matcher.group(2).trim());
        } else {
            // No location found, entire line is title
            experience.setTitle(line.trim());
        }
    }

    /**
     * Parse bulleted description of the experience section
     *
     * @param experience - Experience object to mutate
     * @param startLineIdx - Line index to start looking for bullets
     */
    private void parseExperienceBullets(Experience experience, int startLineIdx) {
        String[] lines = experience.getRawBlock().split("\n");

        if (startLineIdx >= lines.length) return;

        List<String> bullets = new ArrayList<>();

        // Find first bulleted point starting from startLineIdx
        int bulletStartIdx = startLineIdx;
        while (bulletStartIdx < lines.length) {
            String trimmed = lines[bulletStartIdx].trim();
            if (!trimmed.isEmpty() && trimmed.startsWith("-")) {
                break;
            }
            bulletStartIdx++;
        }

        if (bulletStartIdx >= lines.length) return; // No bullets found

        /**
         * Parse bullet points
         * Handle multi-line bullets:
         *   - First line
         *     continuation line
         *     another continuation
         *   - Second bullet
         */
        StringBuilder currentBullet = null;
        for (int i = bulletStartIdx; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;

            if (line.startsWith("-")) {
                // Save previous bullet if exists
                if (currentBullet != null) {
                    bullets.add(currentBullet.toString().trim());
                }

                // Start new bullet (remove leading dash)
                currentBullet = new StringBuilder();
                currentBullet.append(line.substring(1).trim());

            } else if (currentBullet != null) {
                // Continuation of current bullet
                currentBullet.append(" ").append(line);
            }
        }

        // Don't forget the last bullet
        if (currentBullet != null) {
            bullets.add(currentBullet.toString().trim());
        }

        experience.setBullets(bullets);
    }

    private boolean containsDateRange(String line) {
        // Jan 2023 – Jul 2024
        String monthNameRange =
                ".*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+\\d{4}.*";

        // 2023 – 2024 OR 2023 – Present
        String yearRange =
                ".*\\d{4}\\s*[-–—]\\s*(Present|\\d{4}).*";

        // 05/2023 – 07/2024 OR 5/23 – 7/24
        String numericMonthRange =
                ".*\\d{1,2}/\\d{2,4}\\s*[-–—]\\s*(\\d{1,2}/\\d{2,4}|Present).*";

        return line.matches(monthNameRange)
                || line.matches(yearRange)
                || line.matches(numericMonthRange);
    }


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
    private String extractSection(String text, String startHeaderRegex, String endHeadersRegex) {
        try {
            // Find the start header
            Pattern startPattern = Pattern.compile(
                    "(?:^|\\n)\\s*(" + startHeaderRegex + ")\\s*(?:\\n|$)",
                    Pattern.CASE_INSENSITIVE
            );

            Matcher startMatcher = startPattern.matcher(text);
            if (!startMatcher.find()) {
                return ""; // Section not found
            }

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
            System.err.println("Error extracting section: " + e.getMessage());
            return "";
        }
    }
}