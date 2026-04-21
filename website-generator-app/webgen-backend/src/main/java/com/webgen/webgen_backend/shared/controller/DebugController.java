package com.webgen.webgen_backend.shared.controller;

import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugController {

    private final PortfolioRepository portfolioRepository;

    @PostMapping("/create")
    public Portfolio create() {
        Portfolio p = new Portfolio();
        p.setId(UUID.randomUUID());
        p.setUserId(UUID.randomUUID());
        p.setTitle("Test portfolio");
        p.setLastStep("template");
        p.setStyleChatHistory(new ArrayList<>());
        p.setSourceType("GENERATED");

        return portfolioRepository.save(p); // Insert
    }

    @GetMapping("/all")
    public List<Portfolio> getAll() {
        return portfolioRepository.findAll();
    }
}
