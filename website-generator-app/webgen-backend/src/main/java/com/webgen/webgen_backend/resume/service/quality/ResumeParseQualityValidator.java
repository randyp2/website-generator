package com.webgen.webgen_backend.resume.service.quality;

import com.webgen.webgen_backend.resume.model.Experience;
import com.webgen.webgen_backend.resume.model.ParsedResume;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class ResumeParseQualityValidator {

    private static final Pattern CONTACT_LABEL_PATTERN = Pattern.compile(
            "\\b(email|phone|contact|resume|linkedin|github|portfolio)\\b",
            Pattern.CASE_INSENSITIVE
    );
    private static final Pattern URL_OR_EMAIL_PATTERN = Pattern.compile(
            ".*(@|https?://|www\\.|\\.com\\b).*",
            Pattern.CASE_INSENSITIVE
    );
    private static final Pattern ACTION_SENTENCE_PATTERN = Pattern.compile(
            "\\b(achieved|assisted|built|collaborated|communicated|created|delivered|designed|developed|" +
                    "documented|executed|improved|increased|led|managed|organized|performed|provided|" +
                    "supported|trained|utilized|working|improving|serving)\\b",
            Pattern.CASE_INSENSITIVE
    );
    private static final Set<String> US_STATE_NAMES = Set.of(
            "alabama", "alaska", "arizona", "arkansas", "california", "colorado",
            "connecticut", "delaware", "florida", "georgia", "hawaii", "idaho",
            "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana",
            "maine", "maryland", "massachusetts", "michigan", "minnesota",
            "mississippi", "missouri", "montana", "nebraska", "nevada",
            "new hampshire", "new jersey", "new mexico", "new york",
            "north carolina", "north dakota", "ohio", "oklahoma", "oregon",
            "pennsylvania", "rhode island", "south carolina", "south dakota",
            "tennessee", "texas", "utah", "vermont", "virginia", "washington",
            "west virginia", "wisconsin", "wyoming"
    );

    /**
     * Validates whether parsed resume fields look structurally sane.
     *
     * @param resume parsed resume from regex or LLM extraction
     * @return quality result with stable issue codes
     */
    public ResumeParseQualityResult evaluate(ParsedResume resume) {
        List<ResumeParseQualityIssue> issues = new ArrayList<>();

        if (resume == null) {
            issues.add(issue("resume.null", "Parsed resume is null"));
            return ResumeParseQualityResult.reject(issues);
        }

        validateName(resume.getFullName(), issues);
        validateLocation(resume.getLocation(), issues);
        validateExperiences(resume.getExperiences(), issues);
        validateSkills(resume.getSkills(), issues);

        if (issues.isEmpty()) {
            return ResumeParseQualityResult.accept();
        }
        return ResumeParseQualityResult.reject(issues);
    }

    private void validateName(String name, List<ResumeParseQualityIssue> issues) {
        if (isBlank(name)) {
            return;
        }

        String trimmed = name.trim();
        if (CONTACT_LABEL_PATTERN.matcher(trimmed).find()) {
            issues.add(issue("contact.name_contains_label", "Name contains a contact label: " + trimmed));
        }
        if (URL_OR_EMAIL_PATTERN.matcher(trimmed).matches()) {
            issues.add(issue("contact.name_contains_url_or_email", "Name contains URL or email content: " + trimmed));
        }
    }

    private void validateLocation(String location, List<ResumeParseQualityIssue> issues) {
        if (isBlank(location) || !location.contains(",")) {
            return;
        }

        String[] parts = location.split(",", 2);
        if (parts.length != 2) {
            return;
        }

        String left = normalize(parts[0]);
        String right = parts[1].trim();
        if (US_STATE_NAMES.contains(left) && !right.matches("[A-Z]{2}")) {
            issues.add(issue("contact.location_reversed", "Location appears reversed or malformed: " + location));
        }
    }

    private void validateExperiences(List<Experience> experiences, List<ResumeParseQualityIssue> issues) {
        if (experiences == null || experiences.isEmpty()) {
            return;
        }

        int malformedExperiences = 0;
        for (int index = 0; index < experiences.size(); index += 1) {
            Experience experience = experiences.get(index);
            if (experience == null) {
                continue;
            }

            int before = issues.size();
            validateExperienceField("title", experience.getTitle(), index, issues);
            validateExperienceField("company", experience.getCompany(), index, issues);

            if (issues.size() > before) {
                malformedExperiences += 1;
            }
        }

        if (experiences.size() >= 3 && malformedExperiences * 2 >= experiences.size()) {
            issues.add(issue(
                    "experience.malformed_ratio",
                    "At least half of parsed experiences contain malformed title or company fields"
            ));
        }
    }

    private void validateExperienceField(
            String fieldName,
            String value,
            int index,
            List<ResumeParseQualityIssue> issues
    ) {
        if (isBlank(value)) {
            return;
        }

        String trimmed = value.trim();
        if (trimmed.startsWith("-")) {
            issues.add(issue(
                    "experience." + fieldName + "_starts_with_bullet",
                    "Experience " + index + " " + fieldName + " starts with a bullet: " + trimmed
            ));
            return;
        }

        if (looksLikeSentence(trimmed)) {
            issues.add(issue(
                    "experience." + fieldName + "_looks_like_bullet",
                    "Experience " + index + " " + fieldName + " looks like a responsibility sentence: " + trimmed
            ));
        }
    }

    private void validateSkills(List<String> skills, List<ResumeParseQualityIssue> issues) {
        if (skills == null || skills.isEmpty()) {
            return;
        }

        long realSkillCount = skills.stream()
                .filter(skill -> !isBlank(skill))
                .filter(skill -> !looksLikeCategoryOnly(skill))
                .count();

        if (realSkillCount == 0) {
            issues.add(issue("skills.category_labels_only", "Skills contain category labels but no concrete skills"));
        }
    }

    private boolean looksLikeSentence(String value) {
        String trimmed = value.trim();
        int wordCount = trimmed.split("\\s+").length;
        boolean startsLowercase = Character.isLowerCase(trimmed.charAt(0));
        boolean hasSentencePunctuation = trimmed.endsWith(".") || trimmed.endsWith("!") || trimmed.endsWith("?");
        boolean hasActionVerb = ACTION_SENTENCE_PATTERN.matcher(trimmed).find();

        return wordCount >= 5 && (startsLowercase || hasSentencePunctuation || hasActionVerb);
    }

    private boolean looksLikeCategoryOnly(String value) {
        String normalized = normalize(value).replace(":", "").trim();
        return normalized.equals("languages")
                || normalized.equals("frameworks")
                || normalized.equals("tools")
                || normalized.equals("technologies")
                || normalized.equals("technical skills")
                || normalized.equals("skills");
    }

    private ResumeParseQualityIssue issue(String code, String detail) {
        return new ResumeParseQualityIssue(code, detail);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}
