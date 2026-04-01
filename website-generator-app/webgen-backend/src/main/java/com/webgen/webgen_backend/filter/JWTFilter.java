package com.webgen.webgen_backend.filter;


import com.webgen.webgen_backend.service.JWTService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

// Define JWT Filter
@Component
public class JWTFilter extends OncePerRequestFilter {

    @Autowired
    ApplicationContext context;

    @Autowired
    JWTService jwtService;

    /**
     * doFilterInternal is called for EVERY incoming HTTP request
     * before it reaches controllers or request mappings.
     *
     * This is where we:
     *   - extract Authorization header
     *   - verify JWT (delegated to JwtService)
     *   - extract the Supabase user ID
     *   - attach authentication to SecurityContext
     *
     * @param request       the incoming HTTP request
     * @param response      the HTTP response object
     * @param filterChain   the chain of filters Spring will continue processing
     */
    @Override
    public void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Get the header from the request
        String authHeader = request.getHeader("Authorization");
        String token = null;

        // If no token exists, skip setting authentication
        // (user continues as anonymous | blocked by authentication url rules)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        token = authHeader.substring(7); // Extract JWT token
//        System.out.println("Token: " + token.substring(0, 20) + "...");

        try {

            // If not valid token -> skip setting authentication
            if (!jwtService.isValid(token)) {
                filterChain.doFilter(request, response);
                return;
            }

            // Extract supabase user ID
            String userId = jwtService.extractUserId(token);
//            System.out.println("User id: " + userId);

            // If context is not already authenticated create authenticated object
            //  else skip to ensure no double authorization happens
            if (SecurityContextHolder.getContext().getAuthentication() == null) {
//                System.out.println("Creating UPAToken");
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userId,                                                             // principal (who the user is)
                                null,                                                               // null since using JWT
                                List.of(new SimpleGrantedAuthority("ROLE_USER"))               // No roles or authorities (only type of user)
                        );



                // Attach metadata about request
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Adding token to chain so other filters and controllers can see user as authenticated
                SecurityContextHolder.getContext().setAuthentication(authToken);
//
//                System.out.println("Authentication Set: " +
//                        SecurityContextHolder.getContext().getAuthentication());
//                System.out.println("Authorities Set: " +
//                        SecurityContextHolder.getContext().getAuthentication().getAuthorities());
            }
        } catch (Exception e) {
            System.out.println("JWT verification failed: " + e.getMessage());
        }

//        System.out.println("Request URL: " + request.getRequestURI());


        // Continue Spring Security filter chain
        filterChain.doFilter(request, response);

    }

}