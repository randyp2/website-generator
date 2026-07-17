package com.webgen.webgen_backend.portfolio.controller;

import com.webgen.webgen_backend.billing.service.CreditGuardService;
import com.webgen.webgen_backend.portfolio.billing.PortfolioCreditCostPolicy;
import com.webgen.webgen_backend.portfolio.dto.style.StyleChatRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.style.StyleChatResponseDTO;
import com.webgen.webgen_backend.portfolio.dto.style.StyleSuggestionsRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.style.StyleSuggestionsResponseDTO;
import com.webgen.webgen_backend.portfolio.service.crud.PortfolioCrudService;
import com.webgen.webgen_backend.portfolio.service.style.StyleChatService;
import com.webgen.webgen_backend.portfolio.service.style.StyleSuggestionsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import com.webgen.webgen_backend.shared.ratelimit.RateLimiterService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/portfolio/style")
@RequiredArgsConstructor
@Slf4j
public class PortfolioStyleController {

    private final StyleChatService styleChatService;
    private final StyleSuggestionsService styleSuggestionsService;
    private final PortfolioCrudService portfolioCrudService;
    private final CreditGuardService creditGuardService;
    private final RateLimiterService rateLimiterService;

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody StyleChatRequestDTO req) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        rateLimiterService.check("style-chat", userId.toString());
        portfolioCrudService.verifyOwnership(userId, req.getPortfolioId());
        UUID creditReservationId = creditGuardService.reserveUsage(
                userId,
                PortfolioCreditCostPolicy.STYLE_CHAT_USAGE
        ).orElse(null);

        try {
            StyleChatResponseDTO response = styleChatService.chat(req);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            refundReservation(creditReservationId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            refundReservation(creditReservationId, e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/suggestions")
    public ResponseEntity<StyleSuggestionsResponseDTO> suggestions(
            @RequestBody StyleSuggestionsRequestDTO req
    ) {
        String userId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        rateLimiterService.check("style-suggestions", userId);
        StyleSuggestionsResponseDTO response = styleSuggestionsService.getSuggestions(req);
        return ResponseEntity.ok(response);
    }

    private void refundReservation(UUID reservationId, Exception failure) {
        if (reservationId == null) {
            return;
        }
        try {
            creditGuardService.refundCredits(reservationId, failureCode(failure));
        } catch (RuntimeException refundFailure) {
            failure.addSuppressed(refundFailure);
            log.error("Failed to refund credit reservation {}", reservationId, refundFailure);
        }
    }

    private String failureCode(Exception failure) {
        return failure.getClass().getSimpleName();
    }
}
