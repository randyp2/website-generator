package com.webgen.webgen_backend.auth.config;

import ch.qos.logback.classic.spi.ConfiguratorRank;
import com.webgen.webgen_backend.auth.filter.JWTFilter;
import jakarta.servlet.DispatcherType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

    // Verifies the request came from the Next.js server; runs before JWT auth.
    // Does not affect identity verification. See InternalSecretFilter.
    @Autowired
    private com.webgen.webgen_backend.auth.filter.InternalSecretFilter internalSecretFilter;

    // Inject allowed origins from properties file
    @Value("${cors.allowed.origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        // ------ Configure security filter chain ------
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(customizer -> customizer.disable()) // Disable CSRF for stateless
                .authorizeHttpRequests(request -> request
                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/health").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/billing/webhook/stripe").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/public/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/public/portfolio/*/engagement/views").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/public/portfolio/*/engagement/shares").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/public/profile/*/social/views").permitAll()
                        .anyRequest().authenticated())
                .httpBasic(http2 -> http2.disable()) // Enable REST access
                .sessionManagement(
                        session ->
                            session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Make stateless
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(internalSecretFilter, JWTFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();


        // Split comma-separated origins
        for (String origin : allowedOrigins.split(",")) {
            config.addAllowedOrigin(origin.trim());
        }
        config.addAllowedHeader("*"); // Allow all headers (i.e. JWT's)
        config.addAllowedMethod("*"); // Allow all http methods
        config.setAllowCredentials(true); // allow cookies, auth, etc.

        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", config); // Apply to all endpoints in backend

        return src;
    }
}
