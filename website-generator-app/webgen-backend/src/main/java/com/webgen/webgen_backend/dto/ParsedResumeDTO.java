package com.webgen.webgen_backend.dto;

import com.webgen.webgen_backend.model.Project;
import lombok.Data;

import java.util.List;

@Data
public class ParsedResumeDTO {


    private String normalizedText;

    // Contact info
    private String fullName, email, phone, location;

    private List<String> skills;
    private List<ExperienceDTO> experiences;
    private List<ProjectDTO> projects;
    private List<EducationDTO> educations;

}
