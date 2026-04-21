package com.webgen.webgen_backend.portfolio.dto.builder;

import lombok.Data;

import java.util.List;

@Data
public class ValidationResult {
    private boolean valid;
    private List<ValidationError> errors;

    @Data
    public static class ValidationError {
        private String sectionKey;
        private String message;
        private Integer line;
        private Integer column;
    }
}
