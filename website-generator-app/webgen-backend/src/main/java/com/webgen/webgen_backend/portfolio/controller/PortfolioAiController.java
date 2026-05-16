package com.webgen.webgen_backend.portfolio.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.billing.service.CreditGuardService;
import com.webgen.webgen_backend.portfolio.dto.CompletedSectionsResponseDTO;
import com.webgen.webgen_backend.portfolio.dto.JobStatusDTO;
import com.webgen.webgen_backend.portfolio.dto.PortfolioGenerateRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.common.SectionDTO;
import com.webgen.webgen_backend.portfolio.billing.PortfolioCreditCostPolicy;
import com.webgen.webgen_backend.portfolio.service.PortfolioAiService;
import com.webgen.webgen_backend.portfolio.service.job.GenerateJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/portfolio")
@RequiredArgsConstructor
public class PortfolioAiController {

    private final GenerateJobService generateJobService;
    private final PortfolioAiService portfolioAiService;
    private final CreditGuardService creditGuardService;
    private final ObjectMapper objectMapper;

    @PostMapping("/{id}/generate")
    public ResponseEntity<Map<String, String>> generatePortfolio(
            @PathVariable UUID id,
            @RequestBody PortfolioGenerateRequestDTO req) {

        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal());

        creditGuardService.assertHasRequiredCredits(
                userId,
                PortfolioCreditCostPolicy.GENERATE_PORTFOLIO_REQUIRED_CREDITS,
                "portfolio_generation");

        String jobId = generateJobService.createJobAndQueue(id, userId, req);

        return ResponseEntity.accepted().body(Map.of("jobId", jobId));
    }

    @GetMapping("/jobs/status/{jobId}")
    public ResponseEntity<JobStatusDTO> getJobStatus(@PathVariable String jobId) {
        JobStatusDTO jobStatusDTO = generateJobService.getJob(jobId);
        if (jobStatusDTO == null)
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok(jobStatusDTO);

    }

    @GetMapping("/jobs/{jobId}/sections")
    public ResponseEntity<CompletedSectionsResponseDTO> getCompletedSections(
            @PathVariable String jobId,
            @RequestParam(defaultValue = "0") long after) {
        JobStatusDTO job = generateJobService.getJob(jobId);
        if (job == null)
            return ResponseEntity.notFound().build();

        List<String> rawSection = generateJobService.getCompletedSections(jobId, after);

        // Deserialize into SectionDTO
        List<SectionDTO> sections = rawSection.stream()
                .map(json -> {
                    try {
                        return objectMapper.readValue(json, SectionDTO.class);
                    } catch (Exception e) {
                        System.err.println(">>> [CONTROLLER] Failed to deserialize section: " + e.getMessage());
                        return null;
                    }
                })
                .filter(s -> s != null)
                .toList();

        CompletedSectionsResponseDTO response = new CompletedSectionsResponseDTO();
        response.setSections(sections);
        response.setStatus(job.getStatus());
        response.setCompletedCount(job.getCompletedCount());
        response.setTotalSections(job.getTotalSections());

        return ResponseEntity.ok(response);

    }
}
