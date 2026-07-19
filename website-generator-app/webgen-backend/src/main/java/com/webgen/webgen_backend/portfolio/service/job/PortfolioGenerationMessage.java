package com.webgen.webgen_backend.portfolio.service.job;

import com.webgen.webgen_backend.portfolio.dto.PortfolioGenerateRequestDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PortfolioGenerationMessage {
    private String jobId;
    private String portfolioId;
    private String userId;
    private UUID creditReservationId;
    private PortfolioGenerateRequestDTO req;
}
