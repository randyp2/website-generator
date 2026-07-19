package com.webgen.webgen_backend.portfolio.mapper;

import com.webgen.webgen_backend.portfolio.dto.planner.SectionContentDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.SectionPlanInputDTO;
import com.webgen.webgen_backend.portfolio.entity.PortfolioSection;
import org.mapstruct.Mapper;

import java.util.List;

/**
 * Maps persisted portfolio sections to the DTO shapes the refine pipeline
 * consumes. The DB is the source of truth for section content at plan and
 * build time; client payloads never carry section data.
 */
@Mapper(componentModel = "spring")
public interface PortfolioSectionMapper {

    SectionContentDTO toSectionContent(PortfolioSection section);

    List<SectionContentDTO> toSectionContentList(List<PortfolioSection> sections);

    SectionPlanInputDTO toSectionPlanInput(PortfolioSection section);

    List<SectionPlanInputDTO> toSectionPlanInputList(List<PortfolioSection> sections);
}
