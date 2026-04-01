package com.webgen.webgen_backend.dto.portfolio.crud;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class ActivateVersionResponseDTO {
    private UUID portfolioId;
    private UUID activeVersionId;
}
