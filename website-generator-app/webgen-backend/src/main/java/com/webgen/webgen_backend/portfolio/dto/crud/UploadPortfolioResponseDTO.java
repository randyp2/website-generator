package com.webgen.webgen_backend.portfolio.dto.crud;

import com.webgen.webgen_backend.portfolio.dto.common.ResumeDTO;
import lombok.Data;

@Data
public class UploadPortfolioResponseDTO {
    private PortfolioDTO portfolio;
    private ResumeDTO resume;
    private int assetsUploaded;
}
