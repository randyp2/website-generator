package com.webgen.webgen_backend.dto.portfolio.crud;

import com.webgen.webgen_backend.dto.portfolio.common.AssetDTO;
import com.webgen.webgen_backend.dto.portfolio.common.ResumeDTO;
import lombok.Data;

import java.util.List;

@Data
public class PortfolioDetailDTO {
    private PortfolioDTO portfolio;
    private ResumeDTO resume;
    private List<AssetDTO> assets;
}
