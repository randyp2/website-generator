package com.webgen.webgen_backend.controller.portfolio;

import com.webgen.webgen_backend.dto.portfolio.PortfolioGenerateRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.PortfolioGenerateResponseDTO;
import com.webgen.webgen_backend.portfolio_service.PortfolioAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioAiController {

    private final PortfolioAiService portfolioAiService;

    @PostMapping("/generate")
    public ResponseEntity<?> generatePortfolio(
            @RequestBody PortfolioGenerateRequestDTO req
    ) {
        System.out.println(">>> [CONTROLLER] /generate endpoint hit");
        System.out.println(">>> [CONTROLLER] Request templateId: " + req.getTemplateId());
        System.out.println(">>> [CONTROLLER] Request has resume: " + (req.getResume() != null));
        System.out.println(">>> [CONTROLLER] Request userPrompt: " + req.getUserPrompt());

        try {
            System.out.println(">>> [CONTROLLER] Calling portfolioAiService.generatePortfolio()...");
            long startTime = System.currentTimeMillis();

            PortfolioGenerateResponseDTO response = portfolioAiService.generatePortfolio(req);

            long duration = System.currentTimeMillis() - startTime;
            System.out.println(">>> [CONTROLLER] generatePortfolio() completed in " + duration + "ms");
            System.out.println(">>> [CONTROLLER] Response sections count: " + (response.getSections() != null ? response.getSections().size() : 0));

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            System.err.println(">>> [CONTROLLER] Generate error (bad request): " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println(">>> [CONTROLLER] Generate error (internal): " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
