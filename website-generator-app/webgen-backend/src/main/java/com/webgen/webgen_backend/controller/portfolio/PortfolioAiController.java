package com.webgen.webgen_backend.controller.portfolio;

import com.webgen.webgen_backend.dto.portfolio.PortfolioGenerateRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.PortfolioGenerateResponseDTO;
import com.webgen.webgen_backend.portfolio_service.PortfolioAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/portfolio")
@RequiredArgsConstructor
public class PortfolioAiController {

    private final PortfolioAiService portfolioAiService;
    

    @PostMapping("/{id}/generate")
    public ResponseEntity<?> generatePortfolio(
            @PathVariable UUID id,
            @RequestBody PortfolioGenerateRequestDTO req
    ) {
        System.out.println(">>> [CONTROLLER] /{id}/generate endpoint hit, portfolioId=" + id);
        System.out.println(">>> [CONTROLLER] Request templateId: " + req.getTemplateId());
        System.out.println(">>> [CONTROLLER] Request has resume: " + (req.getResume() != null));
        System.out.println(">>> [CONTROLLER] Request userPrompt: " + req.getUserPrompt());

        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );

        try {
            System.out.println(">>> [CONTROLLER] Calling portfolioAiService.generatePortfolio()...");
            long startTime = System.currentTimeMillis();

            PortfolioGenerateResponseDTO response = portfolioAiService.generatePortfolio(id, userId, req);

            long duration = System.currentTimeMillis() - startTime;
            System.out.println(">>> [CONTROLLER] generatePortfolio() completed in " + duration + "ms");
            System.out.println(">>> [CONTROLLER] Response sections count: " + (response.getSections() != null ? response.getSections().size() : 0));

            return ResponseEntity.ok(response);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (IllegalArgumentException e) {
            System.err.println(">>> [CONTROLLER] Generate error (bad request): " + e.getMessage());
            e.printStackTrace();
            String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            return ResponseEntity.badRequest().body(Map.of("error", msg));
        } catch (Exception e) {
            System.err.println(">>> [CONTROLLER] Generate error (internal): " + e.getMessage());
            e.printStackTrace();
            String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            return ResponseEntity.internalServerError().body(Map.of("error", msg));
        }
    }
}
