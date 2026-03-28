package com.webgen.webgen_backend.controller.portfolio;

import com.webgen.webgen_backend.dto.portfolio.pub.PublicPortfolioDTO;
import com.webgen.webgen_backend.portfolio_service.pub.PublicPortfolioService;
import com.webgen.webgen_backend.repository.PortfolioRepository;
import com.webgen.webgen_backend.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/public/portfolio")
@RequiredArgsConstructor
public class PublicPortfolioController {

    private final PublicPortfolioService publicPortfolioService;
    private final PortfolioRepository portfolioRepository;

    @GetMapping("/{slug}")
    public ResponseEntity<PublicPortfolioDTO> getBySlug(@PathVariable String slug) {
        return publicPortfolioService.getBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{slug}/available")
    public ResponseEntity<Map<String, Boolean>> checkSlugAvailability(@PathVariable String slug) {
        boolean available = SlugUtil.isValid(slug) && !portfolioRepository.existsBySlug(slug);
        return ResponseEntity.ok(Map.of("available", available));
    }
}
