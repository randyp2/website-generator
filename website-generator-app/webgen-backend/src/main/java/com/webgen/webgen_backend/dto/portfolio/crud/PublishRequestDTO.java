package com.webgen.webgen_backend.dto.portfolio.crud;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PublishRequestDTO {

    public enum SourceType {
        GENERATED,
        EXTERNAL;

        @JsonCreator
        public static SourceType fromJson(String value) {
            if (value == null || value.isBlank())
                return GENERATED;
            return SourceType.valueOf(value.trim().toUpperCase());
        }
    }

    private String portfolioId;
    private SourceType sourceType = SourceType.GENERATED;
    private String title;
    private String externalUrl;
    private String description;
    private String slug;
}
