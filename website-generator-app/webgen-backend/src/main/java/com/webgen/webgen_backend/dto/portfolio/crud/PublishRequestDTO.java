package com.webgen.webgen_backend.dto.portfolio.crud;

import lombok.Data;

@Data
public class PublishRequestDTO {

    private enum SourceType {
        GENERATED,
        EXTERNAL
    };

    private SourceType sourceType; // generated | external
    private String description;
    private String slug; // optional — if null, auto-generate
}
