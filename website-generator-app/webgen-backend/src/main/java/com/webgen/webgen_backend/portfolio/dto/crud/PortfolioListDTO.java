package com.webgen.webgen_backend.portfolio.dto.crud;

import lombok.Data;

import java.util.List;

@Data
public class PortfolioListDTO {
    private List<PortfolioDTO> portfolios;
}
