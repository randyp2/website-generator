package com.webgen.webgen_backend.dto.portfolio.crud;

import lombok.Data;

@Data
public class PublishRequestDTO {
    private String slug; // optional — if null, auto-generate
}
