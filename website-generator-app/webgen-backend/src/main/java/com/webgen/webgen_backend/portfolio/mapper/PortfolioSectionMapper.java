package com.webgen.webgen_backend.portfolio.mapper;

import com.webgen.webgen_backend.portfolio.dto.planner.SectionContentDTO;
import com.webgen.webgen_backend.portfolio.entity.PortfolioSection;
import org.mapstruct.Mapper;

import java.util.List;

/**
 * Maps persisted portfolio sections to the DTO shape the refine pipeline
 * consumes. The DB is the source of truth for section code at build time;
 * client payloads never carry reactSource.
 */
@Mapper(componentModel = "spring")
public interface PortfolioSectionMapper {

    SectionContentDTO toSectionContent(PortfolioSection section);

    List<SectionContentDTO> toSectionContentList(List<PortfolioSection> sections);
}
