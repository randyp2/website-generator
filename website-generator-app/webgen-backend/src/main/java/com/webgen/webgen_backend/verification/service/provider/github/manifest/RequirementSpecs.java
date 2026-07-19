package com.webgen.webgen_backend.verification.service.provider.github.manifest;

/**
 * Helpers for pip / PEP 508 requirement specifiers, shared by the Python
 * manifest parsers (requirements.txt and pyproject.toml PEP 621 lists).
 */
final class RequirementSpecs {

    private RequirementSpecs() {
    }

    /**
     * Extracts the package name from a requirement spec, dropping version
     * constraints, extras, and environment markers.
     * For example "uvicorn[standard]>=0.29" returns "uvicorn".
     */
    static String packageName(String requirementSpec) {
        if (requirementSpec == null) {
            return "";
        }
        return requirementSpec.trim().split("[\\s\\[(<>=!~;]", 2)[0].trim();
    }
}
