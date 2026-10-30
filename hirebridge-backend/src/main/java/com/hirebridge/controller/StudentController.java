package com.hirebridge.controller;

import com.hirebridge.dto.StudentProfileRequest;
import com.hirebridge.dto.StudentProfileResponse;
import com.hirebridge.service.StudentProfileService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Student-only REST endpoints.
 * The authenticated user's email is extracted from the JWT-backed
 * SecurityContext – never from a client-supplied ID.
 */
@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    private final StudentProfileService profileService;

    public StudentController(StudentProfileService profileService) {
        this.profileService = profileService;
    }

    // ── Dashboard (existing stub – preserved) ─────────────────────────
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, String>> dashboard() {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to the Student Dashboard",
                "role",    "STUDENT"
        ));
    }

    // ── GET profile ───────────────────────────────────────────────────

    /**
     * GET /api/student/profile
     * Returns the saved profile or 204 No Content if not yet created.
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(
            @AuthenticationPrincipal UserDetails principal) {

        return profileService.getProfile(principal.getUsername())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    // ── POST profile (initial creation) ──────────────────────────────

    /**
     * POST /api/student/profile
     * Creates the profile for the first time.
     * Returns 201 Created with the saved profile.
     */
    @PostMapping("/profile")
    public ResponseEntity<StudentProfileResponse> createProfile(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody StudentProfileRequest request) {

        StudentProfileResponse saved = profileService.saveOrUpdate(
                principal.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ── PUT profile (update) ──────────────────────────────────────────

    /**
     * PUT /api/student/profile
     * Updates an existing profile.
     */
    @PutMapping("/profile")
    public ResponseEntity<StudentProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody StudentProfileRequest request) {

        StudentProfileResponse saved = profileService.saveOrUpdate(
                principal.getUsername(), request);
        return ResponseEntity.ok(saved);
    }
}
