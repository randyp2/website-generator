package com.webgen.webgen_backend.resume.mapper;

import com.webgen.webgen_backend.resume.dto.ExperienceDTO;
import com.webgen.webgen_backend.resume.model.Experience;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ExperienceMapper {

    ExperienceDTO toDto(Experience experience);
    Experience toModel(ExperienceDTO dto);


}
