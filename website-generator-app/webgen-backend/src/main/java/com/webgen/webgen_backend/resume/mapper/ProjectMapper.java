package com.webgen.webgen_backend.resume.mapper;

import com.webgen.webgen_backend.resume.dto.ProjectDTO;
import com.webgen.webgen_backend.resume.model.Project;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProjectMapper {

    ProjectDTO toDto(Project project);
    Project toModel(ProjectDTO dto);
}
