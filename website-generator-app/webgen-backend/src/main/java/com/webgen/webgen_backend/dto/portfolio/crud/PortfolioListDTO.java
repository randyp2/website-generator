package com.webgen.webgen_backend.dto.portfolio.crud;

import lombok.Data;

import java.util.List;

@Data
public class PortfolioListDTO {
    private List<PortfolioDTO> portfolios;
}
