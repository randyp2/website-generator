package com.webgen.webgen_backend.controller;


import com.webgen.webgen_backend.model.FormData;
import com.webgen.webgen_backend.service.OpenAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/generate")
@RequiredArgsConstructor
public class AiController {

    private final OpenAiService aiService;

    // Health ping check
    @GetMapping("/ping")
    public String ping() {
        return "AI BACKEND RUNNING!";
    }

    // JWT check
    @GetMapping("/secure")
    public String secureTest() {
        return "You are authenticated as: " + SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    // For landing page demo
    @PostMapping
    public Map<String, String> generateHTML(@RequestBody FormData formData) {
        String html = aiService.generateHTMLCSSFromAi(formData);
        return Map.of("html", html);
    }

    /**
     * Generates a complete portfolio plan using AI based on the provided
     * resume data and user preferences.
     *
     * This endpoint performs a non-idempotent operation that produces
     * a structured portfolio plan composed of modular sections
     * (HTML, CSS, and optional animation JavaScript). The generated plan
     * is intended for immediate preview and future section-level refinement
     *
     * @param request the input data used to generate the portfolio, including
     *                extracted resume information and user-selected preferences
     * @return a {@link PortfolioPlanResponse} containing the generated portfolio
     *         theme and ordered section definitions
     */


}
