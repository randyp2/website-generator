package com.webgen.webgen_backend;

import com.webgen.webgen_backend.billing.config.StripeProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.PropertySource;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(StripeProperties.class)
public class WebgenBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(WebgenBackendApplication.class, args);
	}

}
