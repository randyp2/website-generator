package com.webgen.webgen_backend.notification.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "resend")
@Getter
@Setter
public class ResendProperties {

    private String apiKey;
    private String from;
}
