package com.hirebridge.service;

import com.hirebridge.dto.AuthResponse;
import com.hirebridge.dto.LoginRequest;
import com.hirebridge.dto.RegisterRequest;
import com.hirebridge.exception.DuplicateEmailException;
import com.hirebridge.model.Role;
import com.hirebridge.model.User;
import com.hirebridge.repository.UserRepository;
import com.hirebridge.security.JwtService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Business logic for registration and login.
 */
@Service
public class AuthService {

    private final UserRepository        userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final JwtService            jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository        = userRepository;
        this.passwordEncoder       = passwordEncoder;
        this.jwtService            = jwtService;
        this.authenticationManager = authenticationManager;
    }

    // ── Register ──────────────────────────────────────────────────────

    public AuthResponse register(RegisterRequest request) {

        // ADMIN cannot self-register through the public API
        if (request.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException(
                    "ADMIN accounts cannot be created through public registration");
        }

        // Prevent duplicate emails
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException(request.getEmail());
        }

        // Build and persist the user
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // BCrypt
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setActive(true);

        userRepository.save(user);

        // Issue a JWT so the user is immediately logged in after registration
        String token = jwtService.generateToken(user);

        return new AuthResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                token,
                "Registration successful"
        );
    }

    // ── Login ─────────────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request) {

        // Delegates to DaoAuthenticationProvider → throws BadCredentialsException on failure
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Credentials verified – load the full user and generate token
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("User not found after authentication"));

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                token,
                "Login successful"
        );
    }
}
