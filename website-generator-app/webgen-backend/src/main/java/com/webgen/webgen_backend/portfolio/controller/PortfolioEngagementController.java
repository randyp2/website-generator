package com.webgen.webgen_backend.portfolio.controller;

import com.webgen.webgen_backend.portfolio.dto.engagement.CreatePortfolioCommentRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.engagement.PortfolioCommentDTO;
import com.webgen.webgen_backend.portfolio.dto.engagement.PortfolioEngagementSummaryDTO;
import com.webgen.webgen_backend.portfolio.dto.engagement.UpdatePortfolioCommentRequestDTO;
import com.webgen.webgen_backend.portfolio.service.engagement.PortfolioEngagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/portfolio/engagement")
@RequiredArgsConstructor
public class PortfolioEngagementController {

    private final PortfolioEngagementService portfolioEngagementService;

    @PostMapping("/{portfolioId}/like")
    public ResponseEntity<PortfolioEngagementSummaryDTO> likePortfolio(
            @PathVariable UUID portfolioId) {
        UUID userId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(portfolioEngagementService.likePortfolio(userId, portfolioId));
    }

    @DeleteMapping("/{portfolioId}/like")
    public ResponseEntity<PortfolioEngagementSummaryDTO> unlikePortfolio(
            @PathVariable UUID portfolioId) {
        UUID userId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(portfolioEngagementService.unlikePortfolio(userId, portfolioId));
    }

    @PostMapping("/{portfolioId}/comments")
    public ResponseEntity<PortfolioCommentDTO> createComment(
            @PathVariable UUID portfolioId,
            @RequestBody CreatePortfolioCommentRequestDTO request) {
        UUID userId = resolveAuthenticatedUserId();
        PortfolioCommentDTO response = portfolioEngagementService.createComment(
                userId,
                portfolioId,
                request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/comments/{commentId}")
    public ResponseEntity<PortfolioCommentDTO> updateComment(
            @PathVariable UUID commentId,
            @RequestBody UpdatePortfolioCommentRequestDTO request) {
        UUID userId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(portfolioEngagementService.updateComment(userId, commentId, request));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID commentId) {
        UUID userId = resolveAuthenticatedUserId();
        portfolioEngagementService.deleteComment(userId, commentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/comments/{commentId}/like")
    public ResponseEntity<PortfolioCommentDTO> likeComment(@PathVariable UUID commentId) {
        UUID userId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(portfolioEngagementService.likeComment(userId, commentId));
    }

    @DeleteMapping("/comments/{commentId}/like")
    public ResponseEntity<PortfolioCommentDTO> unlikeComment(@PathVariable UUID commentId) {
        UUID userId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(portfolioEngagementService.unlikeComment(userId, commentId));
    }

    private UUID resolveAuthenticatedUserId() {
        return UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
    }
}
