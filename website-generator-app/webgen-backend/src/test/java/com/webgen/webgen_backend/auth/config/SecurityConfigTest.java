package com.webgen.webgen_backend.auth.config;

import com.webgen.webgen_backend.auth.filter.InternalSecretFilter;
import com.webgen.webgen_backend.auth.filter.JWTFilter;
import com.webgen.webgen_backend.auth.service.JWTService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = SecurityConfigTest.SecurityProbeController.class,
        properties = {
                "cors.allowed.origins=http://localhost:3000",
                "internal.api.secret="
        }
)
@Import({
        SecurityConfig.class,
        JWTFilter.class,
        InternalSecretFilter.class,
        SecurityConfigTest.SecurityProbeController.class,
        SecurityConfigTest.TestBeans.class
})
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void debugPathsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/debug/all"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/debug/create"))
                .andExpect(status().isForbidden());
    }

    @Test
    void healthCheckRemainsPublic() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk());
    }

    @RestController
    static class SecurityProbeController {

        @GetMapping("/api/debug/all")
        String debugAll() {
            return "debug";
        }

        @PostMapping("/api/debug/create")
        String debugCreate() {
            return "debug";
        }

        @GetMapping("/api/health")
        String healthCheck() {
            return "ok";
        }
    }

    @TestConfiguration
    static class TestBeans {

        @Bean
        JWTService jwtService() {
            return new JWTService("http://localhost");
        }
    }
}
