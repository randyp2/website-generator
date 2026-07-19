package com.webgen.webgen_backend.portfolio.dto.upload;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

/** Supported file roles in the portfolio upload workflow. */
public enum PortfolioUploadKind {
    RESUME("resume"),
    IMAGE("image"),
    VIDEO("video");

    private final String value;

    PortfolioUploadKind(String value) {
        this.value = value;
    }

    @JsonValue
    public String value() {
        return value;
    }

    /** Parses the stable lowercase API representation. */
    @JsonCreator
    public static PortfolioUploadKind fromValue(String value) {
        return Arrays.stream(values())
                .filter(kind -> kind.value.equalsIgnoreCase(value == null ? "" : value.trim()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported upload kind"));
    }
}
