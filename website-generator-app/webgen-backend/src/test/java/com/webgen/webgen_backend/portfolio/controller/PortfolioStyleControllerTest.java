package com.webgen.webgen_backend.portfolio.controller;

import com.webgen.webgen_backend.portfolio.dto.style.StyleChatRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.style.StyleChatResponseDTO;
import com.webgen.webgen_backend.portfolio.model.style.StyleContext;
import com.webgen.webgen_backend.portfolio.service.crud.PortfolioCrudService;
import com.webgen.webgen_backend.portfolio.service.style.StyleChatService;
import com.webgen.webgen_backend.portfolio.service.style.StyleSuggestionsService;
import com.webgen.webgen_backend.shared.ratelimit.RateLimitProperties;
import com.webgen.webgen_backend.shared.ratelimit.RateLimiterService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.lang.reflect.Proxy;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class PortfolioStyleControllerTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void styleChatUsesOwnershipAndRateLimitWithoutAUsageReservation() {
        UUID profileId = UUID.randomUUID();
        UUID portfolioId = UUID.randomUUID();
        StyleChatRequestDTO request = new StyleChatRequestDTO();
        request.setPortfolioId(portfolioId);
        request.setUserMessage("Use a warm editorial style");

        StyleChatResponseDTO expected = new StyleChatResponseDTO();
        expected.setAssistantMessage("What typography do you prefer?");
        RecordingStyleChatService chatService = new RecordingStyleChatService(expected);
        StyleSuggestionsService suggestionsService = ignored -> null;
        OwnershipCheck ownershipCheck = new OwnershipCheck();
        PortfolioCrudService portfolioCrudService = portfolioCrudService(ownershipCheck);
        RecordingRateLimiter rateLimiterService = new RecordingRateLimiter();

        PortfolioStyleController controller = new PortfolioStyleController(
                chatService,
                suggestionsService,
                portfolioCrudService,
                rateLimiterService
        );
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(profileId.toString(), null)
        );

        ResponseEntity<?> response = controller.chat(request);

        assertThat(response.getBody()).isSameAs(expected);
        assertThat(rateLimiterService.policyName).isEqualTo("style-chat");
        assertThat(rateLimiterService.callerKey).isEqualTo(profileId.toString());
        assertThat(ownershipCheck.profileId).isEqualTo(profileId);
        assertThat(ownershipCheck.portfolioId).isEqualTo(portfolioId);
        assertThat(chatService.request).isSameAs(request);
    }

    private PortfolioCrudService portfolioCrudService(OwnershipCheck ownershipCheck) {
        return (PortfolioCrudService) Proxy.newProxyInstance(
                PortfolioCrudService.class.getClassLoader(),
                new Class[]{PortfolioCrudService.class},
                (proxy, method, args) -> {
                    if (method.getName().equals("verifyOwnership")) {
                        ownershipCheck.profileId = (UUID) args[0];
                        ownershipCheck.portfolioId = (UUID) args[1];
                        return null;
                    }
                    throw new UnsupportedOperationException(
                            "Unexpected portfolio service call: " + method.getName()
                    );
                }
        );
    }

    private static final class RecordingStyleChatService implements StyleChatService {
        private final StyleChatResponseDTO response;
        private StyleChatRequestDTO request;

        private RecordingStyleChatService(StyleChatResponseDTO response) {
            this.response = response;
        }

        @Override
        public StyleChatResponseDTO chat(StyleChatRequestDTO request) {
            this.request = request;
            return response;
        }

        @Override
        public StyleContext getContext(UUID portfolioId) {
            throw new UnsupportedOperationException("Not used by this test");
        }
    }

    private static final class RecordingRateLimiter extends RateLimiterService {
        private String policyName;
        private String callerKey;

        private RecordingRateLimiter() {
            super(null, new RateLimitProperties());
        }

        @Override
        public void check(String policyName, String callerKey) {
            this.policyName = policyName;
            this.callerKey = callerKey;
        }
    }

    private static final class OwnershipCheck {
        private UUID profileId;
        private UUID portfolioId;
    }
}
