package com.webgen.webgen_backend.mapper;

import com.webgen.webgen_backend.dto.resume.ParsedResumeDTO;
import com.webgen.webgen_backend.model.ParsedResume;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ParsedResumeMapper {
    ParsedResumeDTO toDto(ParsedResume parsedResume);
    ParsedResume toModel(ParsedResumeDTO dto);

}
