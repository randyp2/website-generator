package com.webgen.webgen_backend.portfolio.service.engagement;

import com.webgen.webgen_backend.portfolio.dto.engagement.CreatePortfolioCommentRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.engagement.PortfolioCommentDTO;
import com.webgen.webgen_backend.portfolio.dto.engagement.PortfolioCommentListResponseDTO;
import com.webgen.webgen_backend.portfolio.dto.engagement.PortfolioEngagementSummaryDTO;
import com.webgen.webgen_backend.portfolio.dto.engagement.UpdatePortfolioCommentRequestDTO;

import java.util.UUID;

public interface PortfolioEngagementService {
    PortfolioEngagementSummaryDTO getSummaryBySlug(String slug, UUID viewerId);
    PortfolioCommentListResponseDTO listCommentsBySlug(String slug, UUID viewerId);
    PortfolioEngagementSummaryDTO likePortfolio(UUID userId, UUID portfolioId);
    PortfolioEngagementSummaryDTO unlikePortfolio(UUID userId, UUID portfolioId);
    PortfolioCommentDTO createComment(UUID userId, UUID portfolioId, CreatePortfolioCommentRequestDTO request);
    PortfolioCommentDTO updateComment(UUID userId, UUID commentId, UpdatePortfolioCommentRequestDTO request);
    void deleteComment(UUID userId, UUID commentId);
    PortfolioCommentDTO likeComment(UUID userId, UUID commentId);
    PortfolioCommentDTO unlikeComment(UUID userId, UUID commentId);
    PortfolioEngagementSummaryDTO recordView(String slug);
    PortfolioEngagementSummaryDTO recordShare(String slug);
}
