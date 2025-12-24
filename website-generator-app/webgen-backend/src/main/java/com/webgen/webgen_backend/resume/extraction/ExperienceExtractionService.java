package com.webgen.webgen_backend.resume.extraction;

import com.webgen.webgen_backend.model.Experience;
import com.webgen.webgen_backend.resume.utils.SectionExtractor;
import org.springframework.stereotype.Service;
import org.stringtemplate.v4.ST;

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
            String line = cleanLine(lines[i]);
            if (line.isEmpty()) continue;

            boolean currentHasDate = containsDateRange(line);
            String nextLine = (i + 1 < lines.length) ? cleanLine(lines[i + 1]): "";
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
                String line = cleanLine(lines[i]);
                if (line.isEmpty()) continue;
                rawBlock.append(line).append("\n");
            }

            if (rawBlock.length() == 0) continue;

            Experience exp = new Experience();
            exp.setRawBlock(cleanLine(rawBlock.toString()));
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

        int dateLineIdx = findDateLine(lines);
        if (dateLineIdx == -1) return;

        if (dateLineIdx == 0) {
            String firstLine = lines[0].strip();

            // Format 3: "Title, Company Date"
            if (firstLine.contains(",")) {
                parseTitleCommaCompanyAndDate(experience, firstLine);
                parseExperienceBullets(experience, 1);
            }
            // Format 4: "Title Date" (check if it's a job title, not company)
            else if (!looksLikeCompany(firstLine)) {
                parseTitleAndDate(experience, firstLine);

                if (lines.length > 1) {
                    // Next line should be company + location
                    parseCompanyAndLocation(experience, lines[1]);
                }

                parseExperienceBullets(experience, 2);
            }
            // Format 1: "Company Date"
            else {
                parseCompanyAndDate(experience, firstLine);

                if (lines.length > 1) {
                    parseRoleAndLocation(experience, lines[1]);
                }

                parseExperienceBullets(experience, 1);
            }

        } else if (dateLineIdx == 1) {
            // Format 2: Company on line 0, "Title Date" on line 1
            String firstLine = lines[0].strip();

            if (containsLocation(firstLine)) {
                parseCompanyAndLocation(experience, firstLine);
            } else {
                experience.setCompany(firstLine);
            }

            parseRoleAndDate(experience, lines[1]);
            parseExperienceBullets(experience, 2);
        }

        // FALLBACK: Ensure critical fields are set
        if (experience.getTitle() == null && experience.getCompany() == null) {
            String[] lines2 = experience.getRawBlock().split("\n");
            if (lines2.length > 0) {
                experience.setTitle(lines[0].
                        replaceAll("(?i)(January|February|March|April|May|June|" +
                                "July|August|September|October|November|December|Jan|Feb|" +
                                "Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+\\d{4}.*", "")
                        .strip());
            }
            if (lines2.length > 1) {
                experience.setCompany(lines[1].strip());
            }
        }
    }

    private boolean containsLocation(String line) {
        Pattern locationPattern = Pattern.compile(
                "\\b([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*),\\s*([A-Z]{2}|[A-Z][a-z]+)\\s*$"
        );
        return locationPattern.matcher(line).find();
    }

    /**
     * Parse company and location from same line
     * Format: "UNLV Lee Business College Las Vegas, Nevada"
     */
    private void parseCompanyAndLocation(Experience experience, String line) {
        // Match: "Company Name City, ST" where location is at the end
        // Use negative lookahead to ensure we don't split company names
        Pattern locationPattern = Pattern.compile(
                "^(.+?)\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)?),\\s*([A-Z]{2}|[A-Z][a-z]+)\\s*$"
        );

        Matcher matcher = locationPattern.matcher(line);
        if (matcher.matches()) {
            String potentialCompany = matcher.group(1).trim();
            String potentialLocation = matcher.group(2) + ", " + matcher.group(3);

            // Validate: company should have at least 2 words OR be an acronym
            String[] companyWords = potentialCompany.split("\\s+");

            // If potential company is just one word, it's probably part of the location
            if (companyWords.length >= 2 || potentialCompany.matches("^[A-Z]{2,}$")) {
                experience.setCompany(potentialCompany);
                experience.setLocation(potentialLocation.trim());
            } else {
                // Entire line is company
                experience.setCompany(line.trim());
            }
        } else {
            experience.setCompany(line.trim());
        }
    }

    /**
     * Parse title and date from same line (no company)
     * Format: "Peer Mentor July 2024 - Present"
     */
    private void parseTitleAndDate(Experience experience, String line) {
        // Try full month names first
        Pattern fullMonthPattern = Pattern.compile(
                "(January|February|March|April|May|June|July|August|September|October|November|December)\\s+" +
                        "(\\d{4})\\s*[-–—]\\s*" +
                        "(Present|January|February|March|April|May|June|July|August|September|October|November|December)\\s*(\\d{4})?",
                Pattern.CASE_INSENSITIVE
        );

        Matcher matcher = fullMonthPattern.matcher(line);
        if (matcher.find()) {
            String title = line.substring(0, matcher.start()).trim();
            experience.setTitle(title);
            experience.setStartDate(matcher.group(1) + "-" + matcher.group(2));

            String endPart = matcher.group(3);
            if (endPart.equalsIgnoreCase("Present")) {
                experience.setEndDate("Present");
            } else if (matcher.group(4) != null) {
                // Full date like "July 2024"
                experience.setEndDate(endPart + "-" + matcher.group(4));
            } else {
                experience.setEndDate(endPart);
            }
            return;
        }

        // Try abbreviated months
        Pattern abbrMonthPattern = Pattern.compile(
                "(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+" +
                        "(\\d{4})\\s*[-–—]\\s*" +
                        "(Present|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s*(\\d{4})?",
                Pattern.CASE_INSENSITIVE
        );

        matcher = abbrMonthPattern.matcher(line);
        if (matcher.find()) {
            String title = line.substring(0, matcher.start()).trim();
            experience.setTitle(title);
            experience.setStartDate(matcher.group(1) + "-" + matcher.group(2));

            String endPart = matcher.group(3);
            if (endPart.equalsIgnoreCase("Present")) {
                experience.setEndDate("Present");
            } else if (matcher.group(4) != null) {
                experience.setEndDate(endPart + "-" + matcher.group(4));
            } else {
                experience.setEndDate(endPart);
            }
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
        // Try full month names first
        Pattern fullMonthPattern = Pattern.compile(
                "^(.+?)\\s+" +
                        "(January|February|March|April|May|June|July|August|September|October|November|December)\\s+" +
                        "(\\d{4})\\s*[-–—]\\s*" +
                        "(Present|January|February|March|April|May|June|July|August|September|October|November|December\\s+\\d{4})$",
                Pattern.CASE_INSENSITIVE
        );

        Matcher matcher = fullMonthPattern.matcher(line);
        if (matcher.matches()) {
            experience.setCompany(matcher.group(1).trim());
            experience.setStartDate(matcher.group(2) + "-" + matcher.group(3));

            String endPart = matcher.group(4);
            if (endPart.equalsIgnoreCase("Present")) {
                experience.setEndDate("Present");
            } else {
                // Extract month-year from "July 2024"
                String[] parts = endPart.split("\\s+");
                experience.setEndDate(parts[0] + "-" + parts[1]);
            }
            return;
        }

        // Try abbreviated months
        Pattern abbrPattern = Pattern.compile(
                "^(.+?)\\s+" +
                        "(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+" +
                        "(\\d{4})\\s*[-–—]\\s*" +
                        "(Present|\\d{4})$",
                Pattern.CASE_INSENSITIVE
        );

        matcher = abbrPattern.matcher(line);
        if (matcher.matches()) {
            experience.setCompany(matcher.group(1).trim());
            experience.setStartDate(matcher.group(2) + "-" + matcher.group(3));
            experience.setEndDate(matcher.group(4));
        }
    }

    /**
     * Parse role/title and date from same line
     * Format: "Founder, President & Lead Full-Stack Developer May 2025– Present"
     */
    private void parseRoleAndDate(Experience experience, String line) {
        // Pattern 1: Full month names "July 2024 - July 2024"
        Pattern fullMonthRangePattern = Pattern.compile(
                "(January|February|March|April|May|June|July|August|September|October|November|December)\\s+" +  // Start month
                        "(\\d{4})\\s*[-–—]\\s*" +                                   // Start year
                        "(January|February|March|April|May|June|July|August|September|October|November|December)\\s+" +  // End month
                        "(\\d{4})",                                                  // End year
                Pattern.CASE_INSENSITIVE
        );

        Matcher matcher = fullMonthRangePattern.matcher(line);
        if (matcher.find()) {
            experience.setStartDate(matcher.group(1) + "-" + matcher.group(2));
            experience.setEndDate(matcher.group(3) + "-" + matcher.group(4));

            String title = line.substring(0, matcher.start()).trim();
            experience.setTitle(title);
            return;
        }

        // Pattern 2: Full month to Present "July 2024 - Present"
        Pattern fullMonthPresentPattern = Pattern.compile(
                "(January|February|March|April|May|June|July|August|September|October|November|December)\\s+" +  // Start month
                        "(\\d{4})\\s*[-–—]\\s*" +                                   // Start year
                        "(Present)",                                                 // Present
                Pattern.CASE_INSENSITIVE
        );

        matcher = fullMonthPresentPattern.matcher(line);
        if (matcher.find()) {
            experience.setStartDate(matcher.group(1) + "-" + matcher.group(2));
            experience.setEndDate(matcher.group(3));

            String title = line.substring(0, matcher.start()).trim();
            experience.setTitle(title);
            return;
        }

        // Pattern 3: Abbreviated months "Jan 2023 - Jul 2024"
        Pattern abbrMonthRangePattern = Pattern.compile(
                "(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+" +  // Start month
                        "(\\d{4})\\s*[-–—]\\s*" +                                   // Start year
                        "(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+" +  // End month
                        "(\\d{4})",                                                  // End year
                Pattern.CASE_INSENSITIVE
        );

        matcher = abbrMonthRangePattern.matcher(line);
        if (matcher.find()) {
            experience.setStartDate(matcher.group(1) + "-" + matcher.group(2));
            experience.setEndDate(matcher.group(3) + "-" + matcher.group(4));

            String title = line.substring(0, matcher.start()).trim();
            experience.setTitle(title);
            return;
        }

        // Pattern 4: Abbreviated month to Present "Jan 2024 - Present"
        Pattern abbrMonthPresentPattern = Pattern.compile(
                "(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+" +  // Start month
                        "(\\d{4})\\s*[-–—]\\s*" +                                   // Start year
                        "(Present)",                                                 // Present
                Pattern.CASE_INSENSITIVE
        );

        matcher = abbrMonthPresentPattern.matcher(line);
        if (matcher.find()) {
            experience.setStartDate(matcher.group(1) + "-" + matcher.group(2));
            experience.setEndDate(matcher.group(3));

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

        // Strategy 1: Try to find explicit dashes
        List<String> bullets = parseDashBullets(lines, startLineIdx);

        // Strategy 2: If no dashes found, treat each line as a bullet
        if (bullets.isEmpty()) {
            bullets = parseImplicitBullets(lines, startLineIdx);
        }

        if (!bullets.isEmpty()) {
            experience.setBullets(bullets);
        }

    }

    /**
     * Parse bullets that start with dashes
     */
    private List<String> parseDashBullets(String[] lines, int startLineIdx) {
        List<String> bullets = new ArrayList<>();

        // Find first dashed line
        int bulletStartIdx = startLineIdx;
        while (bulletStartIdx < lines.length) {
            String trimmed = cleanLine(lines[bulletStartIdx]);
            if (!trimmed.isEmpty() && trimmed.startsWith("-")) {
                break;
            }
            bulletStartIdx++;
        }

        if (bulletStartIdx >= lines.length) {
            return bullets; // No dashes found
        }

        // Parse dashed bullets (multi-line support)
        StringBuilder currentBullet = null;
        for (int i = bulletStartIdx; i < lines.length; i++) {
            String line = cleanLine(lines[i]);
            if (line.isEmpty()) continue;

            if (line.startsWith("-")) {
                if (currentBullet != null) {
                    bullets.add(cleanLine(currentBullet.toString()));
                }

                currentBullet = new StringBuilder();
                currentBullet.append(cleanLine(line.substring(1)));

            } else if (currentBullet != null) {
                currentBullet.append(" ").append(line);
            }
        }

        if (currentBullet != null) {
            bullets.add(cleanLine(currentBullet.toString()));
        }

        return bullets;
    }

    /**
     * Parse bullets by treating each descriptive line as a bullet
     * (Fallback when PDF extraction strips dashes)
     */
    private List<String> parseImplicitBullets(String[] lines, int startLineIdx) {
        List<String> bullets = new ArrayList<>();

        StringBuilder currentBullet = null;

        for (int i = startLineIdx; i < lines.length; i++) {
            String line = cleanLine(lines[i]);

            if (line.isEmpty()) continue;
            if (isHeaderLine(line)) continue;
            if (looksLikeCompanyOrLocation(line)) continue;

            // Check if this looks like the START of a bullet
            if (looksLikeBulletStart(line)) {
                // Save previous bullet
                if (currentBullet != null && currentBullet.length() > 0) {
                    String bulletText = currentBullet.toString().trim();
                    if (isDescriptiveLine(bulletText)) {
                        bullets.add(bulletText);
                    }
                }

                // Start new bullet
                currentBullet = new StringBuilder(line);
            }
            // Otherwise, append to current bullet (continuation line)
            else if (currentBullet != null) {
                currentBullet.append(" ").append(line);
            }
        }

        // Don't forget the last bullet
        if (currentBullet != null && currentBullet.length() > 0) {
            String bulletText = currentBullet.toString().trim();
            if (isDescriptiveLine(bulletText)) {
                bullets.add(bulletText);
            }
        }

        return bullets;
    }

    /**
     * Check if line looks like the START of a new bullet
     */
    private boolean looksLikeBulletStart(String line) {
        // Must be reasonable length
        if (line.length() < 20) return false;

        // Must start with capital letter or number
        char firstChar = line.charAt(0);
        if (!Character.isUpperCase(firstChar) && !Character.isDigit(firstChar)) {
            return false;
        }

        // Should contain action verb or metrics (bullet content indicators)
        String lower = line.toLowerCase();
        boolean hasActionIndicator =
                lower.matches(".*(achiev|assist|attend|build|built|collaborat|communic|" +
                        "complet|conduct|consult|coordinat|creat|deliv|demonstrat|" +
                        "design|develop|document|engag|ensur|establish|execut|" +
                        "expand|facilit|foster|guide|implement|improv|increas|" +
                        "initiat|lead|maintain|manag|meet|monitor|organiz|oversee|" +
                        "participat|perform|plan|present|promot|provid|spoke|" +
                        "strengthen|support|test|testif|train|unload|utiliz|mobiliz|" +
                        "\\w+ed\\b).*") ||
                        line.matches(".*\\d+.*"); // Has numbers

        return hasActionIndicator;
    }

    /**
     * Check if line looks like a company name (vs a job title)
     */
    private boolean looksLikeCompany(String line) {
        String lower = line.toLowerCase();

        // Remove date portion to check the actual text
        String withoutDate = line.replaceAll("(?i)(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+\\d{4}\\s*[-–—]\\s*(Present|\\d{4})", "").trim();
        String lowerWithoutDate = withoutDate.toLowerCase();

        // Company indicators
        boolean hasCompanyKeyword =
                lowerWithoutDate.contains("inc") ||
                        lowerWithoutDate.contains("llc") ||
                        lowerWithoutDate.contains("corp") ||
                        lowerWithoutDate.contains("ltd") ||
                        lowerWithoutDate.contains("company") ||
                        lowerWithoutDate.contains("university") ||
                        lowerWithoutDate.contains("college") ||
                        lowerWithoutDate.contains("school") ||
                        lowerWithoutDate.contains("services") ||
                        lowerWithoutDate.contains("youtube") ||
                        lowerWithoutDate.contains("cane");

        if (hasCompanyKeyword) return true;

        // Job title indicators (if present, it's likely a title, not company)
        boolean hasJobTitleKeyword =
                lowerWithoutDate.contains("manager") ||
                        lowerWithoutDate.contains("director") ||
                        lowerWithoutDate.contains("engineer") ||
                        lowerWithoutDate.contains("developer") ||
                        lowerWithoutDate.contains("analyst") ||
                        lowerWithoutDate.contains("assistant") ||
                        lowerWithoutDate.contains("specialist") ||
                        lowerWithoutDate.contains("coordinator") ||
                        lowerWithoutDate.contains("intern") ||
                        lowerWithoutDate.contains("mentor") ||
                        lowerWithoutDate.contains("trainer") ||
                        lowerWithoutDate.contains("member") ||
                        lowerWithoutDate.contains("crew");

        if (hasJobTitleKeyword) return false;

        // If unsure, assume it's a company
        return true;
    }

    /**
        * Check if line looks like a company name or location
        * (to avoid treating them as bullets)
        */
    private boolean looksLikeCompanyOrLocation(String line) {
        if (containsLocation(line)) return true;

        String lower = line.toLowerCase();

        // Use word boundaries to avoid false matches
        boolean hasCompanyKeyword =
                lower.matches(".*\\b(inc|llc|corp|ltd|university|college|school|youtube)\\b.*") ||
                        lower.matches(".*\\b(company|companies)(?!['']s).*"); // ← "company" but not "company's"

        if (hasCompanyKeyword) return true;

        // Multiple commas + ends with state abbreviation
        long commaCount = line.chars().filter(ch -> ch == ',').count();
        if (commaCount >= 2 && line.matches(".*,\\s*[A-Z]{2}\\s*$")) {
            return true;
        }

        // Ends with state abbreviation
        if (line.matches(".*,\\s*[A-Z]{2}\\s*$")) return true;

        return false;
    }

    /**
     * Check if line looks like a header (short, ends with colon, etc.)
     */
    private boolean isHeaderLine(String line) {
        // Too short to be descriptive
        if (line.length() < 15) return true;

        // Ends with colon (section header)
        if (line.endsWith(":")) return true;

        // All caps (probably a section name)
        if (line.equals(line.toUpperCase()) && line.length() < 50) return true;

        return false;
    }

    /**
     * Check if line looks like a descriptive bullet point
     */
    private boolean isDescriptiveLine(String line) {
        if (line.length() < 20 || line.length() > 500) return false;

        char firstChar = line.charAt(0);
        if (!Character.isUpperCase(firstChar) && !Character.isDigit(firstChar)) {
            return false;
        }

        String lower = line.toLowerCase();

        // FIXED: Past tense detection - don't require space after
        boolean hasPastTense = lower.matches(".*\\b\\w+(ed|ted|ded)\\b.*");

        // Action verbs
        boolean hasActionVerb = lower.matches(
                ".*(achiev|assist|attend|build|built|collaborat|communic|complet|conduct|" +
                        "consult|coordinat|creat|deliv|demonstrat|design|develop|document|" +
                        "engag|ensur|establish|execut|expand|facilit|foster|guide|" +
                        "implement|improv|increas|initiat|lead|maintain|manag|" +
                        "meet|monitor|organiz|oversee|participat|perform|plan|" +
                        "present|promot|provid|spoke|strengthen|support|test|testif|train|" +
                        "unload|utiliz|mobiliz).*"
        );

        // Metrics
        boolean hasMetrics = line.matches(".*\\d+.*");

        return hasPastTense || hasActionVerb || hasMetrics || line.length() > 40;
    }

    private boolean containsDateRange(String line) {
        // Format 1: "Jan 2023 – Jul 2024" (abbreviated month-year to month-year)
        String monthYearToMonthYear =
                ".*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+\\d{4}\\s*[-–—]\\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+\\d{4}.*";

        // Format 2: "Jan 2023 – Present" (abbreviated)
        String monthYearToPresent =
                ".*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+\\d{4}\\s*[-–—]\\s*Present.*";

        // Format 3: "July 2024 - Present" (FULL month name to Present)
        String fullMonthToPresent =
                ".*(January|February|March|April|May|June|July|August|September|October|November|December)\\s+\\d{4}\\s*[-–—]\\s*Present.*";

        // Format 4: "July 2024 - July 2024" (FULL month to FULL month)
        String fullMonthToFullMonth =
                ".*(January|February|March|April|May|June|July|August|September|October|November|December)\\s+\\d{4}\\s*[-–—]\\s*(January|February|March|April|May|June|July|August|September|October|November|December)\\s+\\d{4}.*";

        // Format 5: "2023 – 2024" (year only)
        String yearRange =
                ".*\\d{4}\\s*[-–—]\\s*\\d{4}.*";

        // Format 6: "05/2023 – 07/2024" (numeric)
        String numericMonthRange =
                ".*\\d{1,2}/\\d{2,4}\\s*[-–—]\\s*(\\d{1,2}/\\d{2,4}|Present).*";

        return line.matches(monthYearToMonthYear) ||
                line.matches(monthYearToPresent) ||
                line.matches(fullMonthToPresent) ||
                line.matches(fullMonthToFullMonth) ||
                line.matches(yearRange) ||
                line.matches(numericMonthRange);
    }

    /**
     * Remove ALL problematic whitespace and bullet characters
     */
    private String cleanLine(String str) {
        if (str == null) return "";

        // Remove specific problematic character U+F0A7 (decimal 61623)
        str = str.replace('\uF0B7', ' ');

        // Remove other common bullet characters in Private Use Area
        str = str.replaceAll("[\uE000-\uF8FF]", " ");

        // Remove ALL Unicode whitespace categories
        str = str.replaceAll("^\\s+|\\s+$", "");

        return str;
    }




}
