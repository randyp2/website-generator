package com.webgen.webgen_backend.resume.mapper;

import com.webgen.webgen_backend.resume.dto.ParsedResumeDTO;
import com.webgen.webgen_backend.resume.model.ParsedResume;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ParsedResumeMapper {
    ParsedResumeDTO toDto(ParsedResume parsedResume);
    ParsedResume toModel(ParsedResumeDTO dto);

    /**
     * Map metadata fields from ParsedResume to DTO after main mapping.
     */
    @AfterMapping
    default void mapMetadata(ParsedResume source, @MappingTarget ParsedResumeDTO target) {
        if (source.getMetadata() != null) {
            // Extract confidence score
            Object confidenceObj = source.getMetadata().get("confidenceScore");
            if (confidenceObj instanceof Number) {
                target.setConfidenceScore(((Number) confidenceObj).doubleValue());
            }

            // Extract parsing method
            Object parsingMethodObj = source.getMetadata().get("parsingMethod");
            if (parsingMethodObj instanceof String) {
                target.setParsingMethod((String) parsingMethodObj);
            }
        }

        if (target.getSkills() == null) {
            target.setSkills(List.of());
        }
        if (target.getExperiences() == null) {
            target.setExperiences(List.of());
        } else {
            target.getExperiences().forEach(experience -> {
                if (experience.getBullets() == null) {
                    experience.setBullets(List.of());
                }
            });
        }
        if (target.getProjects() == null) {
            target.setProjects(List.of());
        } else {
            target.getProjects().forEach(project -> {
                if (project.getBullets() == null) {
                    project.setBullets(List.of());
                }
            });
        }
        if (target.getEducations() == null) {
            target.setEducations(List.of());
        }
    }

}
