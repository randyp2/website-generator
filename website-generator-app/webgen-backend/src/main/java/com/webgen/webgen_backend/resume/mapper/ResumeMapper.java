package com.webgen.webgen_backend.resume.mapper;

import com.webgen.webgen_backend.portfolio.dto.common.ResumeDTO;
import com.webgen.webgen_backend.resume.entity.Resume;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ResumeMapper {
    @Mapping(source = "portfolio.id", target = "portfolioId")
    ResumeDTO toDto(Resume resume);
}
