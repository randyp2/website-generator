package com.webgen.webgen_backend.verification.service.provider.github.manifest;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.isBlank;

/**
 * Indexes the available {@link ManifestParser}s by file name and routes a
 * repository file to the parser that understands its format.
 */
@Component
public class ManifestDependencyParser {

    private final Map<String, ManifestParser> parsersByFileName;

    public ManifestDependencyParser(List<ManifestParser> parsers) {
        this.parsersByFileName = indexParsers(parsers);
    }

    /** True if a manifest with this file name has a registered parser. */
    public boolean canParse(String fileName) {
        return parsersByFileName.containsKey(fileName);
    }

    /** Parses a manifest's contents into skill signal terms, or empty if unparseable. */
    public Set<String> parse(String fileName, String content) {
        ManifestParser parser = parsersByFileName.get(fileName);
        if (parser == null || isBlank(content)) {
            return Set.of();
        }
        return parser.parse(content);
    }

    private Map<String, ManifestParser> indexParsers(List<ManifestParser> parsers) {
        Map<String, ManifestParser> indexed = new HashMap<>();
        for (ManifestParser parser : parsers) {
            for (String fileName : parser.supportedFileNames()) {
                ManifestParser existing = indexed.putIfAbsent(fileName, parser);
                if (existing != null) {
                    throw new IllegalStateException("Duplicate manifest parser registered for " + fileName);
                }
            }
        }
        return Map.copyOf(indexed);
    }
}
