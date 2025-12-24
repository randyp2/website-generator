package com.webgen.webgen_backend.mapper;

import com.webgen.webgen_backend.dto.ProjectDTO;
import com.webgen.webgen_backend.model.Project;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProjectMapper {

    ProjectDTO toDto(Project project);
    Project toModel(ProjectDTO dto);
}
