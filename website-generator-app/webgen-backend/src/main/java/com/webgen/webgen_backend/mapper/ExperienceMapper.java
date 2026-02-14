package com.webgen.webgen_backend.mapper;

import com.webgen.webgen_backend.dto.resume.ExperienceDTO;
import com.webgen.webgen_backend.model.Experience;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ExperienceMapper {

    ExperienceDTO toDto(Experience experience);
    Experience toModel(ExperienceDTO dto);


}
