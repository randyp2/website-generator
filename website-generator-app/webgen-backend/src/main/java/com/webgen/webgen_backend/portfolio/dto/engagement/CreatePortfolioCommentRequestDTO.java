package com.webgen.webgen_backend.portfolio.dto.engagement;

import lombok.Data;

import java.util.UUID;

@Data
public class CreatePortfolioCommentRequestDTO {
    private UUID parentCommentId;
    private String body;
}
