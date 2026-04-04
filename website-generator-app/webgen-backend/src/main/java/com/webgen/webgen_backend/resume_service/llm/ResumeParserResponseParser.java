package com.webgen.webgen_backend.resume_service.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.model.Education;
import com.webgen.webgen_backend.model.Experience;
import com.webgen.webgen_backend.model.ParsedResume;
import com.webgen.webgen_backend.model.Project;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Parses LLM JSON responses into ParsedResume objects.
 */
@Service
@RequiredArgsConstructor
public class ResumeParserResponseParser {

    private final ObjectMapper objectMapper;

    /**
     * Parse the LLM JSON response into a ParsedResume object.
     * @param rawJson The raw JSON string from LLM
    * @return ParsedResume object
     * @throws IllegalArgumentException if JSON is invalid or cannot be parsed
     */
    public ParsedResume parseResponse(String rawJson) {
        try {
            JsonNode root = objectMapper.readTree(rawJson);

            ParsedResume resume = new ParsedResume();

            // Parse contact information
            resume.setFullName(getTextOrNull(root, "fullName"));
            resume.setEmail(getTextOrNull(root, "email"));
            resume.setPhone(getTextOrNull(root, "phone"));
            resume.setLocation(getTextOrNull(root, "location"));

            // Parse summary
            resume.setSummary(getTextOrNull(root, "summary"));

            // Parse skills
            resume.setSkills(parseSkills(root));

            // Parse experiences
            resume.setExperiences(parseExperiences(root));

            // Parse projects
            resume.setProjects(parseProjects(root));

            // Parse education
            resume.setEducations(parseEducations(root));

            return resume;
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to parse LLM response: " + e.getMessage(), e);
        }
    }

    /**
     * Validate that the parsed resume has minimum required data.
     * @param resume The parsed resume
     * @throws IllegalArgumentException if validation fails
     */
    public void validateResponse(ParsedResume resume) {
        if (resume == null) {
            throw new IllegalArgumentException("Parsed resume is null");
        }

        // At least one of: fullName, email, or phone must be present
        boolean hasContactInfo = (resume.getFullName() != null && !resume.getFullName().trim().isEmpty()) ||
                                (resume.getEmail() != null && !resume.getEmail().trim().isEmpty()) ||
                                (resume.getPhone() != null && !resume.getPhone().trim().isEmpty());

        if (!hasContactInfo) {
            throw new IllegalArgumentException("Resume must have at least name, email, or phone");
        }
    }

    /**
     * Parse skills array from JSON.
     */
    private List<String> parseSkills(JsonNode root) {
        List<String> skills = new ArrayList<>();
        JsonNode skillsNode = root.path("skills");

        if (skillsNode.isArray()) {
            for (JsonNode skillNode : skillsNode) {
                String skill = skillNode.asText();
                if (skill != null && !skill.trim().isEmpty()) {
                    skills.add(skill.trim());
                }
            }
        }

        return skills;
    }

    /**
     * Parse experiences array from JSON.
     */
    private List<Experience> parseExperiences(JsonNode root) {
        List<Experience> experiences = new ArrayList<>();
        JsonNode expNode = root.path("experiences");

        if (expNode.isArray()) {
            for (JsonNode node : expNode) {
                Experience exp = new Experience();
                exp.setTitle(getTextOrNull(node, "title"));
                exp.setCompany(getTextOrNull(node, "company"));
                exp.setStartDate(getTextOrNull(node, "startDate"));
                exp.setEndDate(getTextOrNull(node, "endDate"));
                exp.setLocation(getTextOrNull(node, "location"));
                exp.setBullets(parseStringArray(node, "bullets"));
                experiences.add(exp);
            }
        }

        return experiences;
    }

    /**
     * Parse projects array from JSON.
     */
    private List<Project> parseProjects(JsonNode root) {
        List<Project> projects = new ArrayList<>();
        JsonNode projectsNode = root.path("projects");

        if (projectsNode.isArray()) {
            for (JsonNode node : projectsNode) {
                Project project = new Project();
                project.setHeader(getTextOrNull(node, "header"));
                project.setBullets(parseStringArray(node, "bullets"));
                project.setLink(getTextOrNull(node, "link"));
                projects.add(project);
            }
        }

        return projects;
    }

    /**
     * Parse education array from JSON.
     */
    private List<Education> parseEducations(JsonNode root) {
        List<Education> educations = new ArrayList<>();
        JsonNode eduNode = root.path("educations");

        if (eduNode.isArray()) {
            for (JsonNode node : eduNode) {
                Education edu = new Education();
                edu.setDegree(getTextOrNull(node, "degree"));
                edu.setInstitution(getTextOrNull(node, "institution"));
                edu.setGpa(getTextOrNull(node, "gpa"));
                edu.setStartDate(getTextOrNull(node, "startDate"));
                edu.setEndDate(getTextOrNull(node, "graduationDate"));

                // Note: The Education model has startDate/endDate, but LLM schema uses graduationDate
                // We'll set endDate to graduationDate for compatibility
                if (edu.getEndDate() == null) {
                    edu.setEndDate(getTextOrNull(node, "graduationDate"));
                }

                // Set location from JSON if present
                String location = getTextOrNull(node, "location");
                // Education model doesn't have location field, but we'll store it if model is updated

                educations.add(edu);
            }
        }

        return educations;
    }

    /**
     * Parse a string array from a JSON node.
     */
    private List<String> parseStringArray(JsonNode parent, String fieldName) {
        List<String> result = new ArrayList<>();
        JsonNode arrayNode = parent.path(fieldName);

        if (arrayNode.isArray()) {
            for (JsonNode node : arrayNode) {
                String value = node.asText();
                if (value != null && !value.trim().isEmpty()) {
                    result.add(value.trim());
                }
            }
        }

        return result;
    }

    /**
     * Get text value from JSON node or return null if missing/empty.
     */
    private String getTextOrNull(JsonNode parent, String fieldName) {
        JsonNode node = parent.path(fieldName);
        if (node.isMissingNode() || node.isNull()) {
            return null;
        }
        String text = node.asText();
        return (text != null && !text.trim().isEmpty()) ? text.trim() : null;
    }
}
