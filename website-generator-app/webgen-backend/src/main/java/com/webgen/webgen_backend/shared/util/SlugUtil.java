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

    public static String slugify(String input) {
        if (input == null || input.isBlank()) return "";
        String slug = input.toLowerCase().trim();
        slug = NON_ALPHANUM.matcher(slug).replaceAll("-");
        slug = slug.replaceAll("^-+|-+$", "");
        if (slug.length() > 58) slug = slug.substring(0, 58);
        return slug;
    }

    public static String generateSlug(String name) {
        String base = slugify(name);
        if (base.isEmpty()) base = "portfolio";
        return base + "-" + randomSuffix(4);
    }

    public static boolean isValid(String slug) {
        return slug != null && VALID_SLUG.matcher(slug).matches() && !RESERVED.contains(slug);
    }

    private static String randomSuffix(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(ALPHANUM.charAt(RANDOM.nextInt(ALPHANUM.length())));
        }
        return sb.toString();
    }
}
