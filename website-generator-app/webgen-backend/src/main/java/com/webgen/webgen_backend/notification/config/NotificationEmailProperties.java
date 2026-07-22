package com.webgen.webgen_backend.notification.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Public URLs used by transactional notification emails.
 *
 * <p>Email clients cannot resolve application-relative assets or links, so both
 * values must be reachable from the public internet in production.</p>
 */
@ConfigurationProperties(prefix = "notification.email")
@Getter
@Setter
public class NotificationEmailProperties {

    private String appBaseUrl = "http://localhost:3000";
    private String logoUrl = "https://www.portrn.com/branding/portrn-logo.png";
}
