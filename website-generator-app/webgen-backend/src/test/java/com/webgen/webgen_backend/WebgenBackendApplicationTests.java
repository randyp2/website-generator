package com.webgen.webgen_backend;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@Disabled("Requires Redis, RabbitMQ, and PostgreSQL — run in integration test stage with Testcontainers")
class WebgenBackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
