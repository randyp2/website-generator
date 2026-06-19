package com.webgen.webgen_backend.portfolio.dto.engagement;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PortfolioCommentListResponseDTO {
    private List<PortfolioCommentDTO> comments;
}
