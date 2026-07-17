package com.webgen.webgen_backend.auth.model;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.web.authentication.WebAuthenticationDetails;

/**
 * Request metadata and verified identity claims attached after JWT validation.
 */
public final class AuthenticatedUserDetails extends WebAuthenticationDetails {

    private final String email;

    public AuthenticatedUserDetails(HttpServletRequest request, String email) {
        super(request);
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}
