package com.webgen.webgen_backend.config;

import ch.qos.logback.classic.spi.ConfiguratorRank;
import com.webgen.webgen_backend.filter.JWTFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity // Override default spring security configurations

public class SecurityConfig {
    @Autowired
    private JWTFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        // ------ Configure security filter chain ------
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(customizer -> customizer.disable()) // Disable CSRF for stateless
                .authorizeHttpRequests(request -> request

                        .requestMatchers("/api/generate/ping", "/api/generate")
                        .permitAll() // Endpoints that don't need auth
                        .anyRequest().authenticated())
                .httpBasic(http2 -> http2.disable()) // Enable REST access
                .sessionManagement(
                        session ->
                            session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Make stateless
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("http://localhost:3000"); // Frontend origin
        config.addAllowedHeader("*"); // Allow all headers (i.e. JWT's)
        config.addAllowedMethod("*"); // Allow all http methods
        config.setAllowCredentials(true); // allow cookies, auth, etc.

        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", config); // Apply to all endpoints in backend

        return src;
    }
}

