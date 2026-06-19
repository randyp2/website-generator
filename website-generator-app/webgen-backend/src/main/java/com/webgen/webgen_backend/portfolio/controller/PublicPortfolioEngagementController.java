package com.webgen.webgen_backend.portfolio.controller;

import com.webgen.webgen_backend.portfolio.dto.engagement.PortfolioCommentListResponseDTO;
import com.webgen.webgen_backend.portfolio.dto.engagement.PortfolioEngagementSummaryDTO;
import com.webgen.webgen_backend.portfolio.service.engagement.PortfolioEngagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/portfolio/{slug}/engagement")
@RequiredArgsConstructor
public class PublicPortfolioEngagementController {

    private final PortfolioEngagementService portfolioEngagementService;

    @GetMapping
    public ResponseEntity<PortfolioEngagementSummaryDTO> getSummary(
            @PathVariable String slug) {
        return ResponseEntity.ok(portfolioEngagementService.getSummaryBySlug(slug, null));
    }

    @GetMapping("/comments")
    public ResponseEntity<PortfolioCommentListResponseDTO> listComments(
            @PathVariable String slug) {
        return ResponseEntity.ok(portfolioEngagementService.listCommentsBySlug(slug, null));
    }

    @PostMapping("/views")
    public ResponseEntity<PortfolioEngagementSummaryDTO> recordView(
            @PathVariable String slug) {
        return ResponseEntity.ok(portfolioEngagementService.recordView(slug));
    }

    @PostMapping("/shares")
    public ResponseEntity<PortfolioEngagementSummaryDTO> recordShare(
            @PathVariable String slug) {
        return ResponseEntity.ok(portfolioEngagementService.recordShare(slug));
    }
}
