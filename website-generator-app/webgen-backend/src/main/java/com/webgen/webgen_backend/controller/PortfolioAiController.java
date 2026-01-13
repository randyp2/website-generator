package com.webgen.webgen_backend.controller;

import com.webgen.webgen_backend.dto.portfolio.PortfolioGenerateRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.PortfolioGenerateResponseDTO;
import com.webgen.webgen_backend.portfolio_service.PortfolioAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioAiController {

    private final PortfolioAiService portfolioAiService;

    @PostMapping("/generate")
    public ResponseEntity<PortfolioGenerateResponseDTO> generatePortfolio(
            @RequestBody PortfolioGenerateRequestDTO req
    ) {
        PortfolioGenerateResponseDTO response = portfolioAiService.generatePortfolio(req);

        return ResponseEntity.ok(response);
    }


}
