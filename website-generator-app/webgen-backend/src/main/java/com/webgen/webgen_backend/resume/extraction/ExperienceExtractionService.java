package com.webgen.webgen_backend.resume.extraction;

import com.webgen.webgen_backend.model.Experience;
import com.webgen.webgen_backend.resume.utils.SectionExtractor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


/* ====================================================================================*/
// Service class that helps extract experiences and its metadata
/* ====================================================================================*/
@Service
public class ExperienceExtractionService {


    /**
     * Extract work experiences by locating the work experience subsection and grabbing
     * everything in between.
     *
     * @param text - normalized resume text
     * @return list of experiences on the subsection the experiences resume
     */
    public List<Experience> extractExperience(String text) {

        String experienceSection = SectionExtractor.extractSection(
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



}
