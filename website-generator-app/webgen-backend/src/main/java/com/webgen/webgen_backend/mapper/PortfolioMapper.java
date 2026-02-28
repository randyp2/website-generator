package com.webgen.webgen_backend.mapper;

import com.webgen.webgen_backend.dto.portfolio.crud.PortfolioDTO;
import com.webgen.webgen_backend.entity.Portfolio;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PortfolioMapper {
    PortfolioDTO toDto(Portfolio portfolio);
}
