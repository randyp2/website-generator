package com.webgen.webgen_backend.shared.util;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Loads LLM prompt templates from classpath resources (e.g. resources/prompts/**)
 * and renders {@code {{placeholder}}} variables.
 *
 * Contract:
 * - Resources are read once and cached for the lifetime of the JVM.
 * - {@link #render} is single-pass: substituted values are never re-scanned,
 *   so user-provided content containing {@code {{...}}} cannot inject variables.
 * - A placeholder with no matching value fails fast, replacing the compile-time
 *   safety that inline text blocks with String.formatted() used to provide.
 */
public final class PromptResourceLoader {

    private static final Pattern PLACEHOLDER = Pattern.compile("\\{\\{([a-zA-Z0-9_]+)}}");
    private static final ConcurrentHashMap<String, String> CACHE = new ConcurrentHashMap<>();

    private PromptResourceLoader() {
    }

    /**
     * Returns the UTF-8 contents of a classpath resource, cached after first read.
     *
     * @param classpathLocation resource path without leading slash, e.g. "prompts/style/style-chat-system.md"
     * @throws IllegalStateException if the resource does not exist
     */
    public static String load(String classpathLocation) {
        return CACHE.computeIfAbsent(classpathLocation, PromptResourceLoader::read);
    }

    /**
     * Loads a template and renders it in one call.
     */
    public static String render(String classpathLocation, Map<String, String> values) {
        return renderTemplate(load(classpathLocation), values);
    }

    /**
     * Replaces every {@code {{name}}} in the template with its mapped value.
     *
     * @throws IllegalArgumentException if the template references a name absent from the map
     */
    static String renderTemplate(String template, Map<String, String> values) {
        Matcher matcher = PLACEHOLDER.matcher(template);
        StringBuilder out = new StringBuilder();
        while (matcher.find()) {
            String key = matcher.group(1);
            String value = values.get(key);
            if (value == null) {
                throw new IllegalArgumentException("Missing value for prompt placeholder: " + key);
            }
            matcher.appendReplacement(out, Matcher.quoteReplacement(value));
        }
        matcher.appendTail(out);
        return out.toString();
    }

    private static String read(String location) {
        try (InputStream in = PromptResourceLoader.class.getClassLoader().getResourceAsStream(location)) {
            if (in == null) {
                throw new IllegalStateException("Prompt resource not found on classpath: " + location);
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to read prompt resource: " + location, e);
        }
    }
}
