package com.webgen.webgen_backend.verification.service.fingerprint;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ArtifactSemanticFingerprintGeneratorTest {

    private final ArtifactSemanticFingerprintGenerator generator =
            new ArtifactSemanticFingerprintGenerator();
    private final ArtifactFingerprintSimilarity similarity = new ArtifactFingerprintSimilarity();

    @Test
    void formattingAndFileRenamePreserveSemanticSimilarity() {
        String compact = variedMathSource(false);
        String formatted = variedMathSource(true);

        ArtifactSemanticFingerprint first = fingerprint("src/Math.java", compact);
        ArtifactSemanticFingerprint second = fingerprint("lib/RenamedMath.java", formatted);

        assertThat(first.exactContentHash()).isNotEqualTo(second.exactContentHash());
        assertThat(similarity.compare(first, second)).isEqualTo(1.0d);
    }

    @Test
    void differentImplementationsDoNotMeetDuplicateThreshold() {
        ArtifactSemanticFingerprint account = fingerprint(
                "src/Account.java",
                variedDomainSource("account", "validate", "save"));
        ArtifactSemanticFingerprint report = fingerprint(
                "src/Report.java",
                variedDomainSource("report", "format", "render"));

        assertThat(account.isComparable()).isTrue();
        assertThat(report.isComparable()).isTrue();
        assertThat(similarity.compare(account, report)).isLessThan(0.90d);
    }

    @Test
    void smallScaffoldIsNotComparable() {
        ArtifactSemanticFingerprint fingerprint = fingerprint(
                "src/App.java", "public class App { public static void main() {} }");

        assertThat(fingerprint.isComparable()).isFalse();
    }

    private ArtifactSemanticFingerprint fingerprint(String path, String content) {
        return generator.generate(
                        1,
                        List.of(new ArtifactSemanticFingerprintGenerator.SourceDocument(
                                path, content)))
                .orElseThrow();
    }

    private String variedMathSource(boolean formatted) {
        StringBuilder source = new StringBuilder();
        for (int index = 0; index < 12; index++) {
            if (formatted) {
                source.append("public int add").append(index)
                        .append(" ( int left").append(index).append(", int right")
                        .append(index).append(" ) {\n  return left").append(index)
                        .append(" + right").append(index).append(";\n}\n");
            } else {
                source.append("public int add").append(index)
                        .append("(int left").append(index).append(",int right")
                        .append(index).append("){return left").append(index)
                        .append("+right").append(index).append(";}\n");
            }
        }
        return source.toString();
    }

    private String variedDomainSource(String noun, String action, String result) {
        StringBuilder source = new StringBuilder();
        for (int index = 0; index < 12; index++) {
            source.append("public Object ").append(action).append(index)
                    .append("(String ").append(noun).append(index).append("){")
                    .append(result).append(index).append('(').append(noun).append(index)
                    .append(");return ").append(noun).append(index).append(";}\n");
        }
        return source.toString();
    }
}
