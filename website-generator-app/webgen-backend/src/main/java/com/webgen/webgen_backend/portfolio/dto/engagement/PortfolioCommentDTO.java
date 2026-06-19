package com.webgen.webgen_backend.portfolio.dto.engagement;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PortfolioCommentDTO {
    private UUID id;
    private UUID portfolioId;
    private UUID parentCommentId;
    private UUID authorId;
    private String authorName;
    private String authorUsername;
    private String authorAvatarUrl;
    private String body;
    private String status;
    private int likesCount;
    private int repliesCount;
    private boolean viewerHasLiked;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private List<PortfolioCommentDTO> replies;
}
