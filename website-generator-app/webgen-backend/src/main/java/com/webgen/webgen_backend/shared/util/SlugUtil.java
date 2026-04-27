package com.webgen.webgen_backend.shared.util;

import java.security.SecureRandom;
import java.util.Set;
import java.util.regex.Pattern;

public final class SlugUtil {

    private static final Pattern VALID_SLUG = Pattern.compile("^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$");
    private static final Pattern NON_ALPHANUM = Pattern.compile("[^a-z0-9]+");
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String ALPHANUM = "abcdefghijklmnopqrstuvwxyz0123456789";

    private static final Set<String> RESERVED = Set.of(
            "admin", "api", "explore", "login", "logout", "dashboard",
            "about", "help", "support", "portfolio", "settings", "profile",
            "public", "static", "assets", "null", "undefined"
    );

    private SlugUtil() {}

    /**
     * Converts arbitrary text into a lowercase hyphen-separated slug.
     * Strips leading/trailing hyphens and caps the result at 58 characters.
     *
     * @param input raw text to slugify
     * @return normalized slug, or empty string if input is blank
     */
    public static String slugify(String input) {
        if (input == null || input.isBlank()) return "";
        String slug = input.toLowerCase().trim();
        slug = NON_ALPHANUM.matcher(slug).replaceAll("-");
        slug = slug.replaceAll("^-+|-+$", "");
        if (slug.length() > 58) slug = slug.substring(0, 58);
        return slug;
    }

    /**
     * Generates a slug from a display name with a 4-character random suffix
     * to reduce collision probability.
     *
     * @param name display name to base the slug on
     * @return slug in the format "slugified-name-xxxx"
     */
    public static String generateSlug(String name) {
        String base = slugify(name);
        if (base.isEmpty()) base = "portfolio";

        StringBuilder suffix = new StringBuilder(4);
        for (int i = 0; i < 4; i++) {
            suffix.append(ALPHANUM.charAt(RANDOM.nextInt(ALPHANUM.length())));
        }
        return base + "-" + suffix;
    }

    /**
     * Returns true when the slug matches the allowed character pattern
     * and is not a reserved system path segment.
     *
     * @param slug candidate slug to validate
     * @return true if the slug is safe to publish
     */
    public static boolean isValid(String slug) {
        return slug != null && VALID_SLUG.matcher(slug).matches() && !RESERVED.contains(slug);
    }
}
