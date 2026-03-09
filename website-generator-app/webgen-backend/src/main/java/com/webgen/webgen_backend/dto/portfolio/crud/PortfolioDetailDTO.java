package com.webgen.webgen_backend.dto.portfolio.crud;

import com.webgen.webgen_backend.dto.portfolio.AssetDTO;
import com.webgen.webgen_backend.dto.portfolio.ResumeDTO;
import lombok.Data;

import java.util.List;

@Data
public class PortfolioDetailDTO {
    private PortfolioDTO portfolio;
    private ResumeDTO resume;
    private List<AssetDTO> assets;
}
