package com.webgen.webgen_backend.portfolio.controller;

import com.webgen.webgen_backend.portfolio.dto.verification.CreateSiteOwnershipVerificationRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.verification.SiteOwnershipVerificationDTO;
import com.webgen.webgen_backend.portfolio.model.verification.SiteVerificationMethod;
import com.webgen.webgen_backend.portfolio.model.verification.SiteVerificationStatus;
import com.webgen.webgen_backend.portfolio.service.verification.SiteOwnershipVerificationService;
import com.webgen.webgen_backend.shared.ratelimit.RateLimitProperties;
import com.webgen.webgen_backend.shared.ratelimit.RateLimiterService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SiteOwnershipVerificationControllerTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createsChallengeForAuthenticatedUser() throws Exception {
        UUID userId = UUID.randomUUID();
        RecordingService service = new RecordingService(response());
        RecordingRateLimiter rateLimiter = new RecordingRateLimiter();
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(
                new SiteOwnershipVerificationController(service, rateLimiter)
        ).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(userId.toString(), null)
        );

        mockMvc.perform(post("/api/v1/portfolio/site-verifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"externalUrl\":\"https://example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verificationUrl").value("https://example.com/"))
                .andExpect(jsonPath("$.status").value("PENDING"));

        assertThat(service.userId).isEqualTo(userId);
        assertThat(service.externalUrl).isEqualTo("https://example.com");
        assertThat(rateLimiter.callerKey).isEqualTo(userId.toString());
    }

    private SiteOwnershipVerificationDTO response() {
        return SiteOwnershipVerificationDTO.builder()
                .verificationId(UUID.randomUUID())
                .verificationUrl("https://example.com/")
                .canonicalOrigin("https://example.com")
                .method(SiteVerificationMethod.HTML_META)
                .status(SiteVerificationStatus.PENDING)
                .verificationTag("<meta name=\"webgen-site-verification\" content=\"token\">")
                .challengeExpiresAt(OffsetDateTime.now().plusHours(24))
                .build();
    }

    private static final class RecordingService extends SiteOwnershipVerificationService {
        private final SiteOwnershipVerificationDTO response;
        private UUID userId;
        private String externalUrl;

        private RecordingService(SiteOwnershipVerificationDTO response) {
            super(null, null, null);
            this.response = response;
        }

        @Override
        public SiteOwnershipVerificationDTO createChallenge(
                UUID userId,
                CreateSiteOwnershipVerificationRequestDTO request
        ) {
            this.userId = userId;
            this.externalUrl = request.getExternalUrl();
            return response;
        }
    }

    private static final class RecordingRateLimiter extends RateLimiterService {
        private String callerKey;

        private RecordingRateLimiter() {
            super(null, disabledProperties());
        }

        @Override
        public void check(String policyName, String callerKey) {
            assertThat(policyName).isEqualTo("site-verification-challenge");
            this.callerKey = callerKey;
        }

        private static RateLimitProperties disabledProperties() {
            RateLimitProperties properties = new RateLimitProperties();
            properties.setEnabled(false);
            return properties;
        }
    }
}
