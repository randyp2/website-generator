package com.webgen.webgen_backend.mapper;

import com.webgen.webgen_backend.dto.ExperienceDTO;
import com.webgen.webgen_backend.model.Education;
import com.webgen.webgen_backend.model.Experience;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface ExperienceMapper {

    ExperienceDTO toDto(Experience experience);
    Experience toModel(ExperienceDTO dto);


}
