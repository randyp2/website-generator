package com.webgen.webgen_backend.dto.portfolio.crud;

import com.webgen.webgen_backend.dto.portfolio.ResumeDTO;
import lombok.Data;

@Data
public class UploadPortfolioResponseDTO {
    private PortfolioDTO portfolio;
    private ResumeDTO resume;
    private int assetsUploaded;
}
