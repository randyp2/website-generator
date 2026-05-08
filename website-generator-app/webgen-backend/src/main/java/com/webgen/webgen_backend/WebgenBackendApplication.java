package com.webgen.webgen_backend;

import com.webgen.webgen_backend.billing.config.StripeProperties;
import com.webgen.webgen_backend.shared.config.R2Properties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.PropertySource;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties({StripeProperties.class, R2Properties.class})
public class WebgenBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(WebgenBackendApplication.class, args);
	}

}
