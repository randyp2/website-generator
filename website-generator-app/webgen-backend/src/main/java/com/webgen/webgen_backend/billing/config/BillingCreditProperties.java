package com.webgen.webgen_backend.billing.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** Configures whether billable operations reserve and consume allowances or credits. */
@ConfigurationProperties(prefix = "billing.credit")
@Getter
@Setter
public class BillingCreditProperties {

    private boolean enforcementEnabled = true;
}
