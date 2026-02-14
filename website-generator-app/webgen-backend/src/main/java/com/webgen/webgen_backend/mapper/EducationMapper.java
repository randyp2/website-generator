package com.webgen.webgen_backend.mapper;

import com.webgen.webgen_backend.dto.resume.EducationDTO;
import com.webgen.webgen_backend.model.Education;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EducationMapper {

    EducationDTO toDto(Education education);
    Education toModel(EducationDTO dto);
}
