package com.webgen.webgen_backend.portfolio_service.job;

import com.webgen.webgen_backend.dto.portfolio.PortfolioGenerateRequestDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PortfolioGenerationMessage {
    private String jobId;
    private String portfolioId;
    private String userId;
    private PortfolioGenerateRequestDTO req;
}
