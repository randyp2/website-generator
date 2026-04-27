package com.webgen.webgen_backend.billing.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.Locale;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateCheckoutSessionRequestDTO {

    private PriceKey priceKey;

    public enum PriceKey {
        WEBSITE_GENERATOR_PRO_MONTHLY,
        WEBSITE_GENERATOR_PRO_ANNUAL,
        CREDIT_PACK_SMALL,
        CREDIT_PACK_MEDIUM,
        CREDIT_PACK_LARGE;

        @JsonCreator
        public static PriceKey fromJson(String value) {
            if (value == null || value.isBlank()) {
                throw new IllegalArgumentException("priceKey is required");
            }

            String normalized = value.trim()
                    .toUpperCase(Locale.ROOT)
                    .replace('-', '_')
                    .replace(' ', '_');

            try {
                return switch (normalized) {
                    case "PRO_MONTHLY" -> WEBSITE_GENERATOR_PRO_MONTHLY;
                    case "PRO_ANNUAL" -> WEBSITE_GENERATOR_PRO_ANNUAL;
                    case "CREDIT_SMALL" -> CREDIT_PACK_SMALL;
                    case "CREDIT_MEDIUM" -> CREDIT_PACK_MEDIUM;
                    case "CREDIT_LARGE" -> CREDIT_PACK_LARGE;
                    default -> PriceKey.valueOf(normalized);
                };
            } catch (IllegalArgumentException exception) {
                throw new IllegalArgumentException(
                        "Invalid priceKey '" + value
                                + "'. Allowed values: WEBSITE_GENERATOR_PRO_MONTHLY, WEBSITE_GENERATOR_PRO_ANNUAL,"
                                + " CREDIT_PACK_SMALL, CREDIT_PACK_MEDIUM, CREDIT_PACK_LARGE",
                        exception
                );
            }
        }
    }
}
