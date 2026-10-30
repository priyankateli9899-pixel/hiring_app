package com.hirebridge.controller;

import com.hirebridge.dto.CompanyProfileRequest;
import com.hirebridge.dto.CompanyProfileResponse;
import com.hirebridge.service.CompanyProfileService;
import com.hirebridge.service.VerificationService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Company / Recruiter REST endpoints (RECRUITER role).
 *
 * All /api/recruiter/** paths are secured by SecurityConfig
 * (.requestMatchers("/api/recruiter/**").hasRole("RECRUITER")).
 *
 * ── Endpoints ────────────────────────────────────────────────────────
 *  GET  /api/recruiter/dashboard
 *  GET  /api/recruiter/profile
 *  POST /api/recruiter/profile
 *  PUT  /api/recruiter/profile
 *  POST /api/recruiter/profile/resubmit    ← after NEEDS_INFORMATION
 *  GET  /api/recruiter/jobs/posting-status ← job-posting eligibility check
 */
@RestController
@RequestMapping("/api/recruiter")
@PreAuthorize("hasRole('RECRUITER')")
public class RecruiterController {

    private final CompanyProfileService profileService;
    private final VerificationService   verificationService;

    public RecruiterController(CompanyProfileService profileService,
                               VerificationService   verificationService) {
        this.profileService      = profileService;
        this.verificationService = verificationService;
    }

    // ── Dashboard ─────────────────────────────────────────────────────
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, String>> dashboard() {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to the Recruiter Dashboard",
                "role",    "RECRUITER"
        ));
    }

    // ── Profile CRUD ──────────────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails principal) {
        return profileService.getProfile(principal.getUsername())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/profile")
    public ResponseEntity<CompanyProfileResponse> createProfile(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody CompanyProfileRequest request) {

        CompanyProfileResponse saved = profileService.saveOrUpdate(
                principal.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/profile")
    public ResponseEntity<CompanyProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody CompanyProfileRequest request) {

        CompanyProfileResponse saved = profileService.saveOrUpdate(
                principal.getUsername(), request);
        return ResponseEntity.ok(saved);
    }

    // ── Resubmit after NEEDS_INFORMATION ─────────────────────────────

    /**
     * POST /api/recruiter/profile/resubmit
     * Company calls this after updating their profile to signal they
     * have addressed the admin's information request.  Status reverts
     * from NEEDS_INFORMATION → PENDING for the admin queue.
     */
    @PostMapping("/profile/resubmit")
    public ResponseEntity<CompanyProfileResponse> resubmit(
            @AuthenticationPrincipal UserDetails principal) {

        return ResponseEntity.ok(
                verificationService.resubmit(principal.getUsername()));
    }

    // ── Job posting eligibility check ─────────────────────────────────

    /**
     * GET /api/recruiter/jobs/posting-status
     *
     * Returns the company's current verification status and whether
     * it is eligible to post jobs.  The frontend calls this before
     * showing the Post Job form.
     *
     * IMPORTANT: This is an informational endpoint only.  The actual
     * enforcement happens server-side; a company CANNOT post jobs by
     * calling a hypothetical /api/recruiter/jobs POST endpoint unless
     * it is VERIFIED (that guard lives in the Job controller when Jobs
     * are implemented).
     */
    @GetMapping("/jobs/posting-status")
    public ResponseEntity<Map<String, Object>> postingStatus(
            @AuthenticationPrincipal UserDetails principal) {

        boolean eligible = verificationService.isEligibleToPostJobs(
                principal.getUsername());

        // Also fetch the full profile so the frontend gets the status string
        return profileService.getProfile(principal.getUsername())
                .map(cp -> ResponseEntity.ok(Map.<String, Object>of(
                        "eligible",           eligible,
                        "verificationStatus", cp.getVerificationStatus().name(),
                        "verified",           cp.isVerified(),
                        "rejectionReason",    cp.getRejectionReason() != null
                                              ? cp.getRejectionReason() : ""
                )))
                .orElse(ResponseEntity.ok(Map.of(
                        "eligible",           false,
                        "verificationStatus", "PENDING",
                        "verified",           false,
                        "rejectionReason",    ""
                )));
    }
}
