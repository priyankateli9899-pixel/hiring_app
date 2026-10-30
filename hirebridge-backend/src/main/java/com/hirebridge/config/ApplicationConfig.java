package com.hirebridge.config;

import com.hirebridge.repository.UserRepository;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Infrastructure beans that SecurityConfig and AuthService both depend on.
 *
 * Keeping these in a separate @Configuration class breaks the circular
 * dependency that arises when SecurityConfig defines UserDetailsService
 * while also needing JwtAuthenticationFilter, which itself needs
 * UserDetailsService.
 *
 * Dependency graph after this change:
 *
 *   ApplicationConfig  →  UserRepository          (safe, no cycles)
 *   JwtAuthFilter      →  UserDetailsService       (resolved from ApplicationConfig)
 *   SecurityConfig     →  JwtAuthFilter            (safe, no cycles)
 *                      →  AuthenticationProvider   (resolved from ApplicationConfig)
 *   AuthService        →  PasswordEncoder          (resolved from ApplicationConfig)
 *                      →  AuthenticationManager    (resolved from ApplicationConfig)
 */
@Configuration
public class ApplicationConfig {

    private final UserRepository userRepository;

    public ApplicationConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ── UserDetailsService ────────────────────────────────────────────

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found: " + username));
    }

    // ── PasswordEncoder ───────────────────────────────────────────────

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ── AuthenticationProvider ────────────────────────────────────────

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    // ── AuthenticationManager ─────────────────────────────────────────

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
