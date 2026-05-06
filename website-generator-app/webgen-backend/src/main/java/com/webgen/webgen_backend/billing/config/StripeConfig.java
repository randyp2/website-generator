package com.webgen.webgen_backend.billing.config;

import com.stripe.StripeClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
public class StripeConfig {

    @Bean
    public StripeClient stripeClient(StripeProperties stripeProperties) {
        String secretKey = stripeProperties.getSecretKey();
        if (!StringUtils.hasText(secretKey))
            throw new IllegalStateException("Missing STRIPE_SECRET_KEY");

        return new StripeClient(secretKey);
    }

}
