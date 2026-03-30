package com.webgen.webgen_backend.dto.portfolio.crud;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PublishResponseDTO {
    private String slug;
    private String status;
}
