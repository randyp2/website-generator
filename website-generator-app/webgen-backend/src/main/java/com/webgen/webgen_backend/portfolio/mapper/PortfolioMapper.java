package com.webgen.webgen_backend.portfolio.mapper;

import com.webgen.webgen_backend.portfolio.dto.crud.PortfolioDTO;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PortfolioMapper {
    PortfolioDTO toDto(Portfolio portfolio);
}
