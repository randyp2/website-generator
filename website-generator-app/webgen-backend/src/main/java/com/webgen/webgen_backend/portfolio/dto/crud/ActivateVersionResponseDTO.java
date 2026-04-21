package com.webgen.webgen_backend.portfolio.dto.crud;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class ActivateVersionResponseDTO {
    private UUID portfolioId;
    private UUID activeVersionId;
}
