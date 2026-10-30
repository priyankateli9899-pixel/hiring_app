package com.hirebridge.controller;

import com.hirebridge.dto.CompanyProfileResponse;
import com.hirebridge.dto.VerificationActionRequest;
import com.hirebridge.model.User;
import com.hirebridge.model.VerificationStatus;
import com.hirebridge.service.VerificationService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.hirebridge.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.List;
import java.util.Map;

/**
 * Admin-only endpoints – all secured at class level by @PreAuthorize.
 *
 * ── Company verification lifecycle ──────────────────────────────────
 *
 *  GET  /api/admin/dashboard                  → welcome message
 *  GET  /api/admin/companies                  → list all company profiles
 *  GET  /api/admin/companies?status=PENDING   → filter by VerificationStatus
 *  GET  /api/admin/companies/{id}             → single company details
 *  GET  /api/admin/companies/counts           → counts per status
 *  POST /api/admin/companies/{id}/review      → mark UNDER_REVIEW
 *  POST /api/admin/companies/{id}/approve     → approve → VERIFIED
 *  POST /api/admin/companies/{id}/request     → request more info → NEEDS_INFORMATION
 *  POST /api/admin/companies/{id}/reject      → reject → REJECTED
 *  POST /api/admin/companies/{id}/suspend     → suspend → SUSPENDED
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final VerificationService verificationService;
    private final UserRepository      userRepository;

    public AdminController(VerificationService verificationService,
                           UserRepository userRepository) {
        this.verificationService = verificationService;
        this.userRepository      = userRepository;
    }

    // ── Dashboard stub (preserved) ────────────────────────────────────

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, String>> dashboard() {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to the Admin Dashboard",
                "role",    "ADMIN"
        ));
    }

    // ── List companies ────────────────────────────────────────────────

    /**
     * GET /api/admin/companies
     * Optional query param: ?status=PENDING|UNDER_REVIEW|VERIFIED|...
     * Returns all companies when status is omitted or "ALL".
     */
    @GetMapping("/companies")
    public ResponseEntity<List<CompanyProfileResponse>> listCompanies(
            @RequestParam(required = false) String status) {

        if (status == null || status.isBlank() || status.equalsIgnoreCase("ALL")) {
            return ResponseEntity.ok(verificationService.listAll());
        }
        try {
            VerificationStatus vs = VerificationStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(verificationService.listByStatus(vs));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /** GET /api/admin/companies/counts */
    @GetMapping("/companies/counts")
    public ResponseEntity<Map<String, Long>> companyCounts() {
        return ResponseEntity.ok(verificationService.getCounts());
    }

    /** GET /api/admin/companies/{id} */
    @GetMapping("/companies/{id}")
    public ResponseEntity<CompanyProfileResponse> getCompany(@PathVariable Long id) {
        return ResponseEntity.ok(verificationService.getById(id));
    }

    // ── Verification actions ──────────────────────────────────────────

    /** POST /api/admin/companies/{id}/review → UNDER_REVIEW */
    @PostMapping("/companies/{id}/review")
    public ResponseEntity<CompanyProfileResponse> startReview(
            @PathVariable Long id,
            @RequestBody(required = false) VerificationActionRequest req,
            @AuthenticationPrincipal UserDetails principal) {

        return ResponseEntity.ok(
                verificationService.startReview(id, resolveAdminId(principal),
                        req != null ? req : new VerificationActionRequest()));
    }

    /** POST /api/admin/companies/{id}/approve → VERIFIED */
    @PostMapping("/companies/{id}/approve")
    public ResponseEntity<CompanyProfileResponse> approve(
            @PathVariable Long id,
            @RequestBody(required = false) VerificationActionRequest req,
            @AuthenticationPrincipal UserDetails principal) {

        return ResponseEntity.ok(
                verificationService.approve(id, resolveAdminId(principal),
                        req != null ? req : new VerificationActionRequest()));
    }

    /** POST /api/admin/companies/{id}/request → NEEDS_INFORMATION */
    @PostMapping("/companies/{id}/request")
    public ResponseEntity<CompanyProfileResponse> requestInfo(
            @PathVariable Long id,
            @RequestBody VerificationActionRequest req,
            @AuthenticationPrincipal UserDetails principal) {

        return ResponseEntity.ok(
                verificationService.requestInfo(id, resolveAdminId(principal), req));
    }

    /** POST /api/admin/companies/{id}/reject → REJECTED */
    @PostMapping("/companies/{id}/reject")
    public ResponseEntity<CompanyProfileResponse> reject(
            @PathVariable Long id,
            @RequestBody VerificationActionRequest req,
            @AuthenticationPrincipal UserDetails principal) {

        return ResponseEntity.ok(
                verificationService.reject(id, resolveAdminId(principal), req));
    }

    /** POST /api/admin/companies/{id}/suspend → SUSPENDED */
    @PostMapping("/companies/{id}/suspend")
    public ResponseEntity<CompanyProfileResponse> suspend(
            @PathVariable Long id,
            @RequestBody VerificationActionRequest req,
            @AuthenticationPrincipal UserDetails principal) {

        return ResponseEntity.ok(
                verificationService.suspend(id, resolveAdminId(principal), req));
    }

    // ── Private helpers ───────────────────────────────────────────────

    private Long resolveAdminId(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername())
                .map(u -> u.getId())
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Admin user not found: " + principal.getUsername()));
    }
}
