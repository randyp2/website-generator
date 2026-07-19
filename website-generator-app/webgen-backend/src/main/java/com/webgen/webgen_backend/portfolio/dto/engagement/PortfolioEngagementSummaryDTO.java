package com.webgen.webgen_backend.portfolio.dto.engagement;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class PortfolioEngagementSummaryDTO {
    private UUID portfolioId;
    private int likesCount;
    private int commentsCount;
    private int viewsCount;
    private int sharesCount;
    private boolean viewerHasLiked;
}
