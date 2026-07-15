package com.webgen.webgen_backend.portfolio.dto.crud;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.Locale;
import java.util.UUID;

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
            try {
                return SourceType.valueOf(value.trim().toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException(
                        "Invalid sourceType '" + value + "'. Allowed values: GENERATED, EXTERNAL"
                );
            }
        }
    }

    private String portfolioId;
    private SourceType sourceType = SourceType.GENERATED;
    private String title;
    private String externalUrl;
    private UUID siteVerificationId;
    private String description;
    private String slug;
}
