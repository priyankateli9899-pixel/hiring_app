package com.hirebridge.config;

import com.hirebridge.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security filter-chain configuration.
 *
 * This class is intentionally lean: it owns only the SecurityFilterChain
 * bean. All authentication infrastructure beans (UserDetailsService,
 * PasswordEncoder, AuthenticationProvider, AuthenticationManager) live in
 * ApplicationConfig so that JwtAuthenticationFilter can be constructed
 * without a circular dependency.
 *
 * Cycle that was present (and is now gone):
 *   SecurityConfig → JwtAuthFilter → UserDetailsService
 *                                         ↑ (was defined here)
 *   SecurityConfig ←───────────────────────
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider  authenticationProvider;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter,
                          AuthenticationProvider  authenticationProvider) {
        this.jwtAuthFilter         = jwtAuthFilter;
        this.authenticationProvider = authenticationProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Stateless – no CSRF needed
            .csrf(AbstractHttpConfigurer::disable)

            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth
                // ── Public endpoints ──────────────────────────────────
                .requestMatchers(HttpMethod.GET,  "/api/health").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()

                // ── Role-restricted dashboards ────────────────────────
                .requestMatchers("/api/student/**").hasRole("STUDENT")
                .requestMatchers("/api/recruiter/**").hasRole("RECRUITER")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // ── Everything else requires authentication ────────────
                .anyRequest().authenticated()
            )

            .authenticationProvider(authenticationProvider)

            .addFilterBefore(jwtAuthFilter,
                    UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
