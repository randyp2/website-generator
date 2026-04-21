package com.webgen.webgen_backend.portfolio.dto.crud;

import com.webgen.webgen_backend.portfolio.dto.common.AssetDTO;
import com.webgen.webgen_backend.portfolio.dto.common.ResumeDTO;
import lombok.Data;

import java.util.List;

@Data
public class PortfolioDetailDTO {
    private PortfolioDTO portfolio;
    private ResumeDTO resume;
    private List<AssetDTO> assets;
}
