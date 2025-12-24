package com.webgen.webgen_backend.model;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ParsedResume {

    /**
     * Fully cleaned resume text
     *  - No bullet points
     *  - No semantics
     *  - Pure strings
     *
     */
    private String rawText;
    private String normalizedText; // Cleaned up text


    // Contact info extracted from resume
    private String fullName, email, phone, location;

    // Summary/about me optional
    private String summary;

    // List of detected skills
    private List<String> skills;

    // List of experiences
    private List<Experience> experiences;

    // List of projects
    private List<Project> projects;

    private List<Education> educations;


    /**
     * Optional metadata about parsing quality and confidence.
     * Example:
     * - confidence score
     * - missing sections
     *
     * Useful internally for AI decisions.
     */
    private Map<String, Object> metadata;

}
