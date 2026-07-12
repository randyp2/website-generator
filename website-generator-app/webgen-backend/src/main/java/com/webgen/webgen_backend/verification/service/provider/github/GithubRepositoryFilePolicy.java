package com.webgen.webgen_backend.verification.service.provider.github;

import com.webgen.webgen_backend.verification.service.provider.github.model.GithubTreeResponse;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Set;

import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.isBlank;

/** Selects source files that can safely contribute to repository similarity. */
@Component
public class GithubRepositoryFilePolicy {

    private static final long MAX_FILE_BYTES = 200_000L;
    private static final Set<String> SOURCE_EXTENSIONS = Set.of(
            "c", "cc", "cpp", "cs", "css", "go", "h", "hpp", "html", "java",
            "js", "jsx", "kt", "kts", "php", "py", "rb", "rs", "scala", "scss",
            "sh", "sql", "swift", "ts", "tsx", "vue", "xml", "yaml", "yml");
    private static final Set<String> SOURCE_FILE_NAMES = Set.of(
            "dockerfile", "makefile", "pom.xml", "build.gradle", "build.gradle.kts",
            "settings.gradle", "settings.gradle.kts", "package.json", "go.mod",
            "cargo.toml", "pyproject.toml", "requirements.txt", "docker-compose.yml",
            "docker-compose.yaml");
    private static final Set<String> EXCLUDED_DIRECTORY_NAMES = Set.of(
            ".git", ".next", ".nuxt", ".output", ".gradle", ".idea", ".vscode",
            "build", "coverage", "dist", "generated", "node_modules", "out",
            "target", "vendor");

    public boolean isEligible(GithubTreeResponse.Entry entry) {
        if (entry == null || !"blob".equals(entry.type()) || isBlank(entry.path())) {
            return false;
        }
        if (entry.size() == null || entry.size() <= 0 || entry.size() > MAX_FILE_BYTES) {
            return false;
        }

        String normalizedPath = entry.path().trim().toLowerCase(Locale.ROOT);
        if (isExcludedPath(normalizedPath) || isDocumentationOrLockFile(normalizedPath)) {
            return false;
        }

        String fileName = fileName(normalizedPath);
        if (SOURCE_FILE_NAMES.contains(fileName)) {
            return true;
        }
        int dot = fileName.lastIndexOf('.');
        return dot >= 0 && SOURCE_EXTENSIONS.contains(fileName.substring(dot + 1));
    }

    private boolean isExcludedPath(String path) {
        String[] segments = path.split("/");
        for (int index = 0; index < segments.length - 1; index++) {
            if (EXCLUDED_DIRECTORY_NAMES.contains(segments[index])) {
                return true;
            }
        }
        return false;
    }

    private boolean isDocumentationOrLockFile(String path) {
        String name = fileName(path);
        return name.startsWith("readme")
                || name.startsWith("changelog")
                || name.startsWith("license")
                || name.endsWith(".md")
                || name.endsWith(".lock")
                || name.equals("package-lock.json")
                || name.equals("yarn.lock")
                || name.equals("pnpm-lock.yaml");
    }

    private String fileName(String path) {
        int lastSlash = path.lastIndexOf('/');
        return lastSlash < 0 ? path : path.substring(lastSlash + 1);
    }
}
