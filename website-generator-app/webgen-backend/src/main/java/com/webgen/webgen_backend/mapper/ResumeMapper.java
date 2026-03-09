package com.webgen.webgen_backend.mapper;

import com.webgen.webgen_backend.dto.portfolio.ResumeDTO;
import com.webgen.webgen_backend.entity.Resume;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ResumeMapper {
    @Mapping(source = "portfolio.id", target = "portfolioId")
    ResumeDTO toDto(Resume resume);
}
