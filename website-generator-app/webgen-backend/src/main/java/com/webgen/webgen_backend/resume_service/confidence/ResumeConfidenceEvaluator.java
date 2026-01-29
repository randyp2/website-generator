package com.webgen.webgen_backend.resume_service.confidence;

import com.webgen.webgen_backend.model.Education;
import com.webgen.webgen_backend.model.Experience;
import com.webgen.webgen_backend.model.ParsedResume;
import com.webgen.webgen_backend.model.Project;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Evaluates confidence score (0.0 - 1.0) for parsed resume data quality.
 *
 * Scoring breakdown:
 * - Critical fields (40%): Full name (20pts), Email (20pts)
 * - Important fields (30%): Phone (10pts), Experience with structure (10pts), Skills ≥3 (10pts)
 * - Supporting fields (30%): Location (5pts), Summary >50 chars (5pts), Projects (5pts), Education (5pts), Experience bullets (10pts)
 *
 * Thresholds:
 * - >= 0.70: High confidence
 * - 0.40 - 0.69: Medium confidence
 * - < 0.40: Low confidence (triggers LLM fallback)
 */
@Service
public class ResumeConfidenceEvaluator {

    // Regex patterns for validation
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "^[\\d\\s()+-]{10,}$"
    );
    private static final Pattern NAME_PATTERN = Pattern.compile(
        "^[A-Za-z]+\\s+[A-Za-z]+.*$" // At least 2 words
    );

    /**
     * Evaluate overall confidence score for parsed resume.
     * @param resume The parsed resume to evaluate
     * @return Confidence score from 0.0 to 1.0
     */
    public double evaluateConfidence(ParsedResume resume) {
        if (resume == null) {
            return 0.0;
        }

        double totalScore = 0.0;

        // Critical fields (40 points total)
        totalScore += scoreContactInfo(resume);

        // Important fields (30 points total)
        totalScore += scorePhone(resume);
        totalScore += scoreExperiences(resume.getExperiences());
        totalScore += scoreSkills(resume.getSkills());

        // Supporting fields (30 points total)
        totalScore += scoreSupportingFields(resume);

        // Normalize to 0.0-1.0 range (total is out of 100 points)
        return Math.min(totalScore / 100.0, 1.0);
    }

    /**
     * Score critical contact info: name and email.
     * @return Score 0-40
     */
    private double scoreContactInfo(ParsedResume resume) {
        double score = 0.0;

        // Full name (20 points)
        if (isValidName(resume.getFullName())) {
            score += 20.0;
        }

        // Email (20 points)
        if (isValidEmail(resume.getEmail())) {
            score += 20.0;
        }

        return score;
    }

    /**
     * Score phone number.
     * @return Score 0-10
     */
    private double scorePhone(ParsedResume resume) {
        if (isValidPhone(resume.getPhone())) {
            return 10.0;
        }
        return 0.0;
    }

    /**
     * Score experiences based on structure and completeness.
     * @return Score 0-20 (10 for structure + 10 for bullets)
     */
    private double scoreExperiences(List<Experience> experiences) {
        if (experiences == null || experiences.isEmpty()) {
            return 0.0;
        }

        double score = 0.0;

        // Check for structured experience (10 points)
        long structuredCount = experiences.stream()
            .filter(this::hasStructuredExperience)
            .count();

        if (structuredCount > 0) {
            score += 10.0;
        }

        // Check for experience bullets (10 points)
        long experiencesWithBullets = experiences.stream()
            .filter(exp -> exp.getBullets() != null && !exp.getBullets().isEmpty())
            .count();

        if (experiencesWithBullets > 0) {
            score += 10.0;
        }

        return score;
    }

    /**
     * Score skills list.
     * @return Score 0-10
     */
    private double scoreSkills(List<String> skills) {
        if (skills == null || skills.isEmpty()) {
            return 0.0;
        }

        // Filter out empty or very short skills
        long validSkills = skills.stream()
            .filter(skill -> skill != null && skill.trim().length() >= 2)
            .count();

        // At least 3 valid skills = 10 points
        if (validSkills >= 3) {
            return 10.0;
        }
        // 1-2 skills = partial credit
        return validSkills * 3.33;
    }

    /**
     * Score supporting fields: location, summary, projects, education.
     * @return Score 0-20
     */
    private double scoreSupportingFields(ParsedResume resume) {
        double score = 0.0;

        // Location (5 points)
        if (isValidLocation(resume.getLocation())) {
            score += 5.0;
        }

        // Summary >50 chars (5 points)
        if (resume.getSummary() != null && resume.getSummary().trim().length() > 50) {
            score += 5.0;
        }

        // Projects (5 points)
        if (hasValidProjects(resume.getProjects())) {
            score += 5.0;
        }

        // Education (5 points)
        if (hasValidEducation(resume.getEducations())) {
            score += 5.0;
        }

        return score;
    }

    /**
     * Validate full name: at least 2 words, no symbols.
     */
    public boolean isValidName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return false;
        }
        String trimmed = name.trim();
        return NAME_PATTERN.matcher(trimmed).matches() && trimmed.length() >= 3;
    }

    /**
     * Validate email format.
     */
    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email.trim()).matches();
    }

    /**
     * Validate phone number.
     */
    private boolean isValidPhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return false;
        }
        return PHONE_PATTERN.matcher(phone.trim()).matches();
    }

    /**
     * Validate location (basic check).
     */
    private boolean isValidLocation(String location) {
        return location != null && location.trim().length() >= 3;
    }

    /**
     * Check if experience has structured data (title, company, dates, bullets).
     */
    public boolean hasStructuredExperience(Experience exp) {
        if (exp == null) {
            return false;
        }

        boolean hasTitle = exp.getTitle() != null && !exp.getTitle().trim().isEmpty();
        boolean hasCompany = exp.getCompany() != null && !exp.getCompany().trim().isEmpty();
        boolean hasDates = (exp.getStartDate() != null && !exp.getStartDate().trim().isEmpty()) ||
                          (exp.getEndDate() != null && !exp.getEndDate().trim().isEmpty());

        // At least title + company + one date
        return hasTitle && hasCompany && hasDates;
    }

    /**
     * Check if projects list is valid.
     */
    private boolean hasValidProjects(List<Project> projects) {
        if (projects == null || projects.isEmpty()) {
            return false;
        }

        return projects.stream()
            .anyMatch(project -> project.getHeader() != null &&
                               !project.getHeader().trim().isEmpty());
    }

    /**
     * Check if education list is valid.
     */
    private boolean hasValidEducation(List<Education> educations) {
        if (educations == null || educations.isEmpty()) {
            return false;
        }

        return educations.stream()
            .anyMatch(edu -> (edu.getInstitution() != null && !edu.getInstitution().trim().isEmpty()) ||
                           (edu.getDegree() != null && !edu.getDegree().trim().isEmpty()));
    }
}
