package com.webgen.webgen_backend.resume.service;

import com.webgen.webgen_backend.resume.model.ParsedResume;
import com.webgen.webgen_backend.resume.service.extraction.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class ResumeExtractionService {

    private final SkillExtractionService skillExtractionService;
    private final ExperienceExtractionService experienceExtractionService;
    private final ProjectExtractionService projectExtractionService;
    private final EducationExtractionService educationExtractionService;
    private final ContactInfoExtractionService contactInfoExtractionService;
    private final SummaryExtractionService summaryExtractionService;


    public ParsedResume extract(String normalizedText) {

        ParsedResume parsedResume = new ParsedResume(); // To populate

        // Store normalized text
        parsedResume.setNormalizedText(normalizedText);

        parsedResume.setSkills(skillExtractionService.extractSkills(normalizedText));
        parsedResume.setExperiences(experienceExtractionService.extractExperience(normalizedText));

        parsedResume.setProjects(projectExtractionService.extractProjects(normalizedText));
        parsedResume.setEducations(educationExtractionService.extractEducations(normalizedText));

        contactInfoExtractionService.extractContactInfo(parsedResume, normalizedText);
        parsedResume.setSummary(summaryExtractionService.extract(normalizedText));
        return parsedResume;
    }


}