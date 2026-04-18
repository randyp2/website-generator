package com.webgen.webgen_backend.portfolio.dto.crud;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PublishResponseDTO {
    // Return portfolioID
    // Connecting external portfolio creates a new row -> must return new Id
    private String portfolioId;
    private String slug;
    private String status;
    private PublishRequestDTO.SourceType sourceType;
    private String externalUrl;
}
