package com.webgen.webgen_backend.resume_service;

import com.webgen.webgen_backend.resume.dto.ParsedResumeDTO;
import com.webgen.webgen_backend.resume.mapper.ParsedResumeMapper;
import com.webgen.webgen_backend.resume.model.Experience;
import com.webgen.webgen_backend.resume.model.ParsedResume;
import com.webgen.webgen_backend.resume.model.Project;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ParsedResumeMapperTest {

    private final ParsedResumeMapper mapper = Mappers.getMapper(ParsedResumeMapper.class);

    @Test
    void mapsMissingCollectionsToEmptyLists() {
        ParsedResume resume = new ParsedResume();

        ParsedResumeDTO dto = mapper.toDto(resume);

        assertThat(dto.getSkills()).isEmpty();
        assertThat(dto.getExperiences()).isEmpty();
        assertThat(dto.getProjects()).isEmpty();
        assertThat(dto.getEducations()).isEmpty();
    }

    @Test
    void mapsMissingNestedBulletsToEmptyLists() {
        Experience experience = new Experience();
        Project project = new Project();
        ParsedResume resume = new ParsedResume();
        resume.setExperiences(List.of(experience));
        resume.setProjects(List.of(project));

        ParsedResumeDTO dto = mapper.toDto(resume);

        assertThat(dto.getExperiences()).hasSize(1);
        assertThat(dto.getExperiences().getFirst().getBullets()).isEmpty();
        assertThat(dto.getProjects()).hasSize(1);
        assertThat(dto.getProjects().getFirst().getBullets()).isEmpty();
    }
}
