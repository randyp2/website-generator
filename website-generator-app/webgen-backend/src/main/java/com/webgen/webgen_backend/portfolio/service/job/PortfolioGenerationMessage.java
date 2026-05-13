package com.webgen.webgen_backend.portfolio.service.job;

import com.webgen.webgen_backend.portfolio.dto.PortfolioGenerateRequestDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PortfolioGenerationMessage {
    private String jobId;
    private String portfolioId;
    private String userId;
    private PortfolioGenerateRequestDTO req;
}
