package com.webgen.webgen_backend.shared.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Liveness endpoint for the AWS load balancer target group health check.
 *
 * Intentionally dependency-free: it confirms the process is up and serving HTTP
 * without touching the database, Redis, or any downstream service, so a
 * transient dependency blip never fails the check and cycles the task. Public
 * and exempt from the internal-secret filter (see SecurityConfig and
 * InternalSecretProperties).
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }
}
