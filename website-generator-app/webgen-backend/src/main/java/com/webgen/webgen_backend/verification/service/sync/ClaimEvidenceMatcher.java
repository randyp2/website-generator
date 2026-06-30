package com.webgen.webgen_backend.verification.service.sync;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.verification.entity.Evidence;
import com.webgen.webgen_backend.verification.service.sync.model.ClaimEvidenceMatchResult;
import com.webgen.webgen_backend.verification.service.sync.model.ClaimTermSet;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.addMatchingTerm;
import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.containsTerm;
import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.containsTermInCollection;
import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.isBlank;
import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.normalizeForMatch;
import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.readNormalizedArray;
import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.readText;

@Component
@RequiredArgsConstructor
public class ClaimEvidenceMatcher {

    private static final Map<String, Set<String>> COMMON_TERM_ALIASES = Map.ofEntries(
            Map.entry("react", Set.of("reactjs")),
            Map.entry("reactjs", Set.of("react")),
            Map.entry("node.js", Set.of("nodejs")),
            Map.entry("nodejs", Set.of("node.js")),
            Map.entry("next.js", Set.of("nextjs")),
            Map.entry("nextjs", Set.of("next.js")),
            Map.entry("c#", Set.of("csharp")),
            Map.entry("csharp", Set.of("c#")),
            Map.entry("c++", Set.of("cpp")),
            Map.entry("cpp", Set.of("c++")),
            Map.entry(".net", Set.of("dotnet")),
            Map.entry("dotnet", Set.of(".net")));

    private final ObjectMapper objectMapper;

    public ClaimTermSet buildTermSet(
            String rawValue,
            String canonicalName,
            List<String> aliases) {
        Set<String> terms = new LinkedHashSet<>();

        addMatchingTerm(terms, rawValue);
        addMatchingTerm(terms, canonicalName);
        aliases.forEach(alias -> addMatchingTerm(terms, alias));

        Set<String> expanded = new LinkedHashSet<>(terms);
        for (String term : terms) {
            if (COMMON_TERM_ALIASES.containsKey(term)) {
                COMMON_TERM_ALIASES.get(term)
                        .forEach(alias -> addMatchingTerm(expanded, alias));
            }
        }

        return new ClaimTermSet(expanded);
    }

    public ClaimEvidenceMatchResult evaluate(ClaimTermSet termSet, Evidence evidence) {
        if (!"repository".equalsIgnoreCase(evidence.getEvidenceType())) {
            return ClaimEvidenceMatchResult.noMatch();
        }

        JsonNode metadata = evidence.getMetadata();
        List<String> topics = readNormalizedArray(metadata, "topics");
        List<String> dependencies = readNormalizedArray(metadata, "dependencies");
        JsonNode dependencySources = metadata == null ? null : metadata.get("dependencySources");
        String repoName = normalizeForMatch(readText(metadata, "repo_name"));
        String fullName = normalizeForMatch(readText(metadata, "full_name"));
        String description = normalizeForMatch(evidence.getDescription());
        String primaryLanguage = normalizeForMatch(readText(metadata, "primary_language"));

        ClaimEvidenceMatchResult best = ClaimEvidenceMatchResult.noMatch();

        for (String term : termSet.terms()) {
            String matchedDependency = firstMatchingDependency(dependencies, term);
            if (matchedDependency != null) {
                return buildMatch(
                        "dependency_match",
                        BigDecimal.valueOf(0.95),
                        "Dependency signal matched: " + term,
                        term,
                        "dependency",
                        readSourceFile(dependencySources, matchedDependency));
            }

            if (containsTermInCollection(topics, term)) {
                best = maxMatch(
                        best,
                        buildMatch(
                                "topic_match",
                                BigDecimal.valueOf(0.85),
                                "Topic signal matched: " + term,
                                term,
                                "topic",
                                null));
            }

            if (containsTerm(repoName, term) || containsTerm(fullName, term)) {
                best = maxMatch(
                        best,
                        buildMatch(
                                "name_match",
                                BigDecimal.valueOf(0.78),
                                "Repository name matched: " + term,
                                term,
                                "name",
                                null));
            }

            if (containsTerm(description, term)) {
                best = maxMatch(
                        best,
                        buildMatch(
                                "description_match",
                                BigDecimal.valueOf(0.70),
                                "Repository description matched: " + term,
                                term,
                                "description",
                                null));
            }
        }

        if (!isBlank(primaryLanguage)
                && termSet.terms().contains(primaryLanguage)
                && best.matched()) {
            best = maxMatch(
                    best,
                    buildMatch(
                            "language_plus_text_match",
                            BigDecimal.valueOf(0.55),
                            "Language matched with supporting repository signal",
                            primaryLanguage,
                            "language",
                            null));
        }

        return best;
    }

    private ClaimEvidenceMatchResult maxMatch(
            ClaimEvidenceMatchResult left,
            ClaimEvidenceMatchResult right) {
        if (!left.matched()) {
            return right;
        }
        if (!right.matched()) {
            return left;
        }
        return right.confidence().compareTo(left.confidence()) > 0 ? right : left;
    }

    private ClaimEvidenceMatchResult buildMatch(
            String linkType,
            BigDecimal confidence,
            String reason,
            String matchedTerm,
            String signal,
            String sourceFile) {
        ObjectNode metadata = objectMapper.createObjectNode();
        metadata.put("matched_term", matchedTerm);
        metadata.put("signal", signal);
        if (!isBlank(sourceFile)) {
            metadata.put("source_file", sourceFile);
        }

        return new ClaimEvidenceMatchResult(true, linkType, confidence, reason, metadata);
    }

    // Returns the dependency value the term matched (so its source file can be
    // resolved), or null when no dependency matches.
    private String firstMatchingDependency(List<String> dependencies, String term) {
        for (String dependency : dependencies) {
            if (containsTerm(dependency, term)) {
                return dependency;
            }
        }
        return null;
    }

    private String readSourceFile(JsonNode dependencySources, String dependency) {
        if (dependencySources == null || !dependencySources.isObject()) {
            return null;
        }
        JsonNode source = dependencySources.get(dependency);
        return source != null && source.isTextual() ? source.asText() : null;
    }
}
