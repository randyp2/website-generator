package com.webgen.webgen_backend.controller;

import com.webgen.webgen_backend.dto.portfolio.style.StyleChatRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.style.StyleChatResponseDTO;
import com.webgen.webgen_backend.portfolio_service.style.StyleChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/portfolio/style")
@RequiredArgsConstructor
public class PortfolioStyleController {

    private final StyleChatService styleChatService;

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody StyleChatRequestDTO req) {
        try {
            StyleChatResponseDTO response = styleChatService.chat(req);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
