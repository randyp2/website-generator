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
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/portfolio/style")
@RequiredArgsConstructor
public class PortfolioStyleController {

    private final StyleChatService styleChatService;
    private final StyleSuggestionsService styleSuggestionsService;
    private final PortfolioCrudService portfolioCrudService;
    private final CreditGuardService creditGuardService;

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody StyleChatRequestDTO req) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        portfolioCrudService.verifyOwnership(userId, req.getPortfolioId());
        creditGuardService.assertHasRequiredCredits(
                userId,
                PortfolioCreditCostPolicy.STYLE_CHAT_REQUIRED_CREDITS,
                "style_chat"
        );

        try {
            StyleChatResponseDTO response = styleChatService.chat(req);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/suggestions")
    public ResponseEntity<StyleSuggestionsResponseDTO> suggestions(
            @RequestBody StyleSuggestionsRequestDTO req
    ) {
        StyleSuggestionsResponseDTO response = styleSuggestionsService.getSuggestions(req);
        return ResponseEntity.ok(response);
    }
}
