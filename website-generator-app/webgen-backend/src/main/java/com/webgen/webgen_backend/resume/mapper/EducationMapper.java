package com.webgen.webgen_backend.resume.mapper;

import com.webgen.webgen_backend.resume.dto.EducationDTO;
import com.webgen.webgen_backend.resume.model.Education;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EducationMapper {

    EducationDTO toDto(Education education);
    Education toModel(EducationDTO dto);
}
