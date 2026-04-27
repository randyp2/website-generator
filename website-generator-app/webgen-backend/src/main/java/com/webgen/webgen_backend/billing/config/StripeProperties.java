package com.webgen.webgen_backend.billing.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "stripe")
@Getter
@Setter
public class StripeProperties {

    private String secretKey;
    private String webhookSecret;
    private String successUrl;
    private String cancelUrl;
    private Price price = new Price();

    @Getter
    @Setter
    public static class Price {

        private String websiteGeneratorProMonthly;
        private String websiteGeneratorProAnnual;
        private String creditPackSmall;
        private String creditPackMedium;
        private String creditPackLarge;
    }

}
