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

    @GetMapping("/ping")
    public String ping() {
        return "AI BACKEND RUNNING!";
    }

    @GetMapping("/secure")
    public String secureTest() {
        return "You are authenticated as: " + SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
    @PostMapping
    public Map<String, String> generateHTML(@RequestBody FormData formData) {
        String html = aiService.generateHTMLCSSFromAi(formData);
        return Map.of("html", html);
    }

}
