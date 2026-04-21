package com.webgen.webgen_backend.portfolio.controller;

import com.webgen.webgen_backend.portfolio.dto.pub.PublicPortfolioCardDTO;
import com.webgen.webgen_backend.portfolio.dto.pub.PublicPortfolioDTO;
import com.webgen.webgen_backend.portfolio.service.pub.PublicPortfolioService;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import com.webgen.webgen_backend.shared.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/public/portfolio")
@RequiredArgsConstructor
public class PublicPortfolioController {

    private final PublicPortfolioService publicPortfolioService;
    private final PortfolioRepository portfolioRepository;

    @GetMapping
    public ResponseEntity<Page<PublicPortfolioCardDTO>> listPublished(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        size = Math.min(size, 50);
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
        return ResponseEntity.ok(publicPortfolioService.listPublished(pageRequest));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<PublicPortfolioDTO> getBySlug(@PathVariable String slug) {
        return publicPortfolioService.getBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/{slug}/html", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getHtmlBySlug(@PathVariable String slug) {
        return publicPortfolioService.getHtmlBySlug(slug)
                .map(html -> ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{slug}/available")
    public ResponseEntity<Map<String, Boolean>> checkSlugAvailability(@PathVariable String slug) {
        boolean available = SlugUtil.isValid(slug) && !portfolioRepository.existsBySlug(slug);
        return ResponseEntity.ok(Map.of("available", available));
    }
}
