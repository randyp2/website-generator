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
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import com.webgen.webgen_backend.shared.ratelimit.RateLimiterService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/portfolio")
@RequiredArgsConstructor
@Slf4j
public class PortfolioAiController {

    private final GenerateJobService generateJobService;
    private final PortfolioAiService portfolioAiService;
    private final CreditGuardService creditGuardService;
    private final ObjectMapper objectMapper;
    private final RateLimiterService rateLimiterService;

    @PostMapping("/{id}/generate")
    public ResponseEntity<Map<String, String>> generatePortfolio(
            @PathVariable UUID id,
            @RequestBody PortfolioGenerateRequestDTO req) {

        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal());

        rateLimiterService.check("portfolio-generate", userId.toString());

        UUID creditReservationId = creditGuardService.reserveUsage(
                userId,
                PortfolioCreditCostPolicy.GENERATE_PORTFOLIO_USAGE
        ).orElse(null);

        try {
            String jobId = generateJobService.createJobAndQueue(
                    id,
                    userId,
                    creditReservationId,
                    req
            );

            return ResponseEntity.accepted().body(Map.of("jobId", jobId));
        } catch (RuntimeException failure) {
            refundReservation(creditReservationId, failure);
            throw failure;
        }
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
                        log.error("Failed to deserialize completed section reason={}", e.getMessage(), e);
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

    private void refundReservation(UUID reservationId, RuntimeException failure) {
        if (reservationId == null) {
            return;
        }
        try {
            creditGuardService.refundCredits(reservationId, failureCode(failure));
        } catch (RuntimeException refundFailure) {
            failure.addSuppressed(refundFailure);
            log.error("Failed to refund credit reservation {}", reservationId, refundFailure);
        }
    }

    private String failureCode(Exception failure) {
        return failure.getClass().getSimpleName();
    }
}
