package com.webgen.webgen_backend.controller.portfolio;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.dto.portfolio.*;
import com.webgen.webgen_backend.portfolio_service.PortfolioAiService;
import com.webgen.webgen_backend.portfolio_service.job.GenerateJobService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
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
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String QUEUE_KEY = "gen:queue:portfolio";

    @PostMapping("/{id}/generate")
    public ResponseEntity<Map<String, String>> generatePortfolio(
            @PathVariable UUID id,
            @RequestBody PortfolioGenerateRequestDTO req) {

        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal());

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

    @GetMapping("/jobs/sections/{jobId}")
    public ResponseEntity<CompletedSectionsResponseDTO> getCompletedSections(
            @PathVariable String jobId,
            @RequestParam(defaultValue = "0") long after
    ) {
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


    // @PostMapping("/{id}/generate")
    // public ResponseEntity<?> generatePortfolio(
    // @PathVariable UUID id,
    // @RequestBody PortfolioGenerateRequestDTO req) {
    // System.out.println(">>> [CONTROLLER] /{id}/generate endpoint hit,
    // portfolioId=" + id);
    // System.out.println(">>> [CONTROLLER] Request templateId: " +
    // req.getTemplateId());
    // System.out.println(">>> [CONTROLLER] Request has resume: " + (req.getResume()
    // != null));
    // System.out.println(">>> [CONTROLLER] Request userPrompt: " +
    // req.getUserPrompt());
    //
    // UUID userId = UUID.fromString(
    // (String)
    // SecurityContextHolder.getContext().getAuthentication().getPrincipal());
    //
    // try {
    // System.out.println(">>> [CONTROLLER] Calling
    // portfolioAiService.generatePortfolio()...");
    // long startTime = System.currentTimeMillis();
    //
    // PortfolioGenerateResponseDTO response =
    // portfolioAiService.generatePortfolio(id, userId, req);
    //
    // long duration = System.currentTimeMillis() - startTime;
    // System.out.println(">>> [CONTROLLER] generatePortfolio() completed in " +
    // duration + "ms");
    // System.out.println(">>> [CONTROLLER] Response sections count: "
    // + (response.getSections() != null ? response.getSections().size() : 0));
    //
    // return ResponseEntity.ok(response);
    // } catch (ResponseStatusException e) {
    // throw e;
    // } catch (IllegalArgumentException e) {
    // System.err.println(">>> [CONTROLLER] Generate error (bad request): " +
    // e.getMessage());
    // e.printStackTrace();
    // String msg = e.getMessage() != null ? e.getMessage() :
    // e.getClass().getSimpleName();
    // return ResponseEntity.badRequest().body(Map.of("error", msg));
    // } catch (Exception e) {
    // System.err.println(">>> [CONTROLLER] Generate error (internal): " +
    // e.getMessage());
    // e.printStackTrace();
    // String msg = e.getMessage() != null ? e.getMessage() :
    // e.getClass().getSimpleName();
    // return ResponseEntity.internalServerError().body(Map.of("error", msg));
    // }
    // }


}
