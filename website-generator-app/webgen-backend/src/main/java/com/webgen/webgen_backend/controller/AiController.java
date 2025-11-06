package com.webgen.webgen_backend.controller;


import com.webgen.webgen_backend.model.FormData;
import com.webgen.webgen_backend.service.OpenAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/generate")

// Allow any frontend to access this backend change later when in production to domain
@CrossOrigin(origins="*")
@RequiredArgsConstructor
public class AiController {

    private final OpenAiService aiService;

    @GetMapping("/ping")
    public String ping() {
        return "AI BACKEND RUNNING!";
    }

    @PostMapping
    public Map<String, String> generateHTML(@RequestBody FormData formData) {
        String html = aiService.generateHTMLCSSFromAi(formData);
        return Map.of("html", html);
    }

}
