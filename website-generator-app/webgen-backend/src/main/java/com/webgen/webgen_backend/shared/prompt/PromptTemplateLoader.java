package com.webgen.webgen_backend.shared.prompt;

import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Loads markdown prompt templates from classpath resources and caches them in memory.
 */
@Component
public class PromptTemplateLoader {

    private final ResourceLoader resourceLoader;
    private final Map<String, String> cache = new ConcurrentHashMap<>();

    public PromptTemplateLoader(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    /**
     * Loads a markdown template from classpath.
     *
     * @param path classpath-relative path such as prompts/agent/agent-turn-system.md
     * @return template content
     */
    public String load(String path) {
        return cache.computeIfAbsent(path, this::readTemplate);
    }

    /**
     * Reads template content from classpath as UTF-8 text.
     */
    private String readTemplate(String path) {
        String resourcePath = path.startsWith("classpath:") ? path : "classpath:" + path;
        Resource resource = resourceLoader.getResource(resourcePath);
        if (!resource.exists()) {
            throw new IllegalStateException("Prompt template not found: " + resourcePath);
        }

        try (var inputStream = resource.getInputStream()) {
            return StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to read prompt template: " + resourcePath, exception);
        }
    }
}
