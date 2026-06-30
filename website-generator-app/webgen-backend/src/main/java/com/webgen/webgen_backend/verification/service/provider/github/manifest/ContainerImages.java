package com.webgen.webgen_backend.verification.service.provider.github.manifest;

/**
 * Helpers for container image references, shared by the Docker manifest parsers
 * (Dockerfile FROM lines and docker-compose image values).
 */
final class ContainerImages {

    private ContainerImages() {
    }

    /**
     * Reduces a container image reference to its base name, dropping any registry
     * path, tag, and digest. For example "mcr.microsoft.com/dotnet/sdk:8.0"
     * returns "sdk" and "postgres:15" returns "postgres".
     * Returns "" for variable references (e.g. ${BASE_IMAGE}) and "scratch".
     */
    static String baseName(String imageReference) {
        if (imageReference == null) {
            return "";
        }
        String image = imageReference.trim();
        if (image.isEmpty() || image.contains("$") || "scratch".equalsIgnoreCase(image)) {
            return "";
        }
        image = image.split("@", 2)[0];                 // drop digest
        int lastSlash = image.lastIndexOf('/');
        if (lastSlash >= 0) {
            image = image.substring(lastSlash + 1);     // keep the final path segment
        }
        return image.split(":", 2)[0];                  // drop tag
    }
}
