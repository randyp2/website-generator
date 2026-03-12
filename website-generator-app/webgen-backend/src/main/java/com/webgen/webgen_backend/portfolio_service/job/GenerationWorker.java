package com.webgen.webgen_backend.portfolio_service.job;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.dto.portfolio.JobStatusDTO;
import com.webgen.webgen_backend.dto.portfolio.PortfolioGenerateRequestDTO;
import com.webgen.webgen_backend.portfolio_service.PortfolioAiService;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class GenerationWorker {

    private static final String QUEUE_KEY = "gen:queue:portfolio";

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final GenerateJobService jobService;
    private final PortfolioAiService portfolioAiService;

    /**
     * Check queue for existing job
     * - Run generatePortfolio on an existing job
     */
    @Scheduled(fixedDelay = 1, timeUnit = TimeUnit.SECONDS)
    public void pollQueue() {

        // Get raw json job description from queue
        String workItem = redisTemplate.opsForList().rightPop(QUEUE_KEY);
        if (workItem == null)
            return;

        String jobId = null;

        try {
            JsonNode root = objectMapper.readTree(workItem);

            // Check for bad work payload
            if (root.path("jobId").isMissingNode()
                    || root.path("portfolioId").isMissingNode()
                    || root.path("userId").isMissingNode()) {

                System.err.println(">>> [WORKER] Bad work payload in redis queue");
                return; // Skip job
            }

            // Parse work payload
            jobId = root.path("jobId").asText();
            UUID portfolioId = UUID.fromString(root.path("portfolioId").asText());
            UUID userId = UUID.fromString(root.path("userId").asText());
            PortfolioGenerateRequestDTO req = objectMapper.treeToValue(
                    root.path("req"),
                    PortfolioGenerateRequestDTO.class);

            // Update status and generate portfolio
            jobService.updateStatus(jobId, JobStatusDTO.Status.PROCESSING);
            portfolioAiService.generatePortfolio(portfolioId, userId, req, jobId);
            jobService.updateStatus(jobId, JobStatusDTO.Status.COMPLETED);

        } catch (Exception e) {
            System.err.println(">>> [WORKER] Job failed: " + e.getMessage());

            if (jobId != null)
                jobService.failJob(jobId, e.getMessage());
        }
    }

}
