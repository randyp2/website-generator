package com.webgen.webgen_backend.resume.dto;

import lombok.Data;

import java.util.List;

@Data
public class ParsedResumeDTO {


    private String normalizedText;

    // Contact info
    private String fullName, email, phone, location;
    private String summary;
    private List<String> skills;
    private List<ExperienceDTO> experiences;
    private List<ProjectDTO> projects;
    private List<EducationDTO> educations;

    // Parsing metadata
    private Double confidenceScore;
    private String parsingMethod; // "regex", "llm", "regex_low_confidence", "regex_low_quality"

}
