package com.hirebridge.service;

import com.hirebridge.dto.CompanyProfileResponse;
import com.hirebridge.dto.VerificationActionRequest;
import com.hirebridge.model.CompanyProfile;
import com.hirebridge.model.User;
import com.hirebridge.model.VerificationStatus;
import com.hirebridge.repository.CompanyProfileRepository;
import com.hirebridge.repository.UserRepository;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin-only service for the company verification lifecycle.
 *
 *  - list / filter companies from PostgreSQL
 *  - approve, request more info, reject, suspend
 *  - check whether a recruiter is VERIFIED (used by job-posting guard)
 *
 * All status changes record the admin's user ID and a timestamp.
 * The company's boolean `verified` flag is kept in sync by
 * CompanyProfile.syncVerifiedFlag() via @PrePersist / @PreUpdate.
 */
@Service
public class VerificationService {

    private final CompanyProfileRepository profileRepo;
    private final UserRepository           userRepo;

    public VerificationService(CompanyProfileRepository profileRepo,
                               UserRepository userRepo) {
        this.profileRepo = profileRepo;
        this.userRepo    = userRepo;
    }

    // ── Admin: list companies ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CompanyProfileResponse> listAll() {
        return profileRepo.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(CompanyProfileResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CompanyProfileResponse> listByStatus(VerificationStatus status) {
        return profileRepo.findByVerificationStatusOrderByCreatedAtDesc(status)
                .stream()
                .map(CompanyProfileResponse::from)
                .collect(Collectors.toList());
    }

    // ── Admin: get one company ────────────────────────────────────────

    @Transactional(readOnly = true)
    public CompanyProfileResponse getById(Long profileId) {
        CompanyProfile cp = loadProfile(profileId);
        return CompanyProfileResponse.from(cp);
    }

    // ── Admin: stats ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Map<String, Long> getCounts() {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (VerificationStatus s : VerificationStatus.values()) {
            counts.put(s.name(), profileRepo.countByVerificationStatus(s));
        }
        counts.put("TOTAL", profileRepo.count());
        return counts;
    }

    // ── Admin: change status to UNDER_REVIEW ─────────────────────────

    @Transactional
    public CompanyProfileResponse startReview(Long profileId, Long adminUserId,
                                              VerificationActionRequest req) {
        CompanyProfile cp = loadProfile(profileId);
        cp.setVerificationStatus(VerificationStatus.UNDER_REVIEW);
        cp.setReviewedByAdminId(adminUserId);
        cp.setReviewedAt(LocalDateTime.now());
        if (req.getAdminNotes() != null) cp.setAdminNotes(req.getAdminNotes());
        return CompanyProfileResponse.from(profileRepo.save(cp));
    }

    // ── Admin: APPROVE ────────────────────────────────────────────────

    @Transactional
    public CompanyProfileResponse approve(Long profileId, Long adminUserId,
                                          VerificationActionRequest req) {
        CompanyProfile cp = loadProfile(profileId);
        cp.setVerificationStatus(VerificationStatus.VERIFIED);
        cp.setReviewedByAdminId(adminUserId);
        cp.setReviewedAt(LocalDateTime.now());
        if (req.getAdminNotes() != null)  cp.setAdminNotes(req.getAdminNotes());
        cp.setRejectionReason(null); // clear any old rejection reason
        return CompanyProfileResponse.from(profileRepo.save(cp));
    }

    // ── Admin: REQUEST MORE INFORMATION ──────────────────────────────

    @Transactional
    public CompanyProfileResponse requestInfo(Long profileId, Long adminUserId,
                                              VerificationActionRequest req) {
        if (req.getReason() == null || req.getReason().isBlank()) {
            throw new IllegalArgumentException(
                    "A reason is required when requesting more information.");
        }
        CompanyProfile cp = loadProfile(profileId);
        cp.setVerificationStatus(VerificationStatus.NEEDS_INFORMATION);
        cp.setRejectionReason(req.getReason());   // company sees this as "what's needed"
        cp.setReviewedByAdminId(adminUserId);
        cp.setReviewedAt(LocalDateTime.now());
        if (req.getAdminNotes() != null) cp.setAdminNotes(req.getAdminNotes());
        return CompanyProfileResponse.from(profileRepo.save(cp));
    }

    // ── Admin: REJECT ─────────────────────────────────────────────────

    @Transactional
    public CompanyProfileResponse reject(Long profileId, Long adminUserId,
                                         VerificationActionRequest req) {
        if (req.getReason() == null || req.getReason().isBlank()) {
            throw new IllegalArgumentException("A rejection reason is required.");
        }
        CompanyProfile cp = loadProfile(profileId);
        cp.setVerificationStatus(VerificationStatus.REJECTED);
        cp.setRejectionReason(req.getReason());
        cp.setReviewedByAdminId(adminUserId);
        cp.setReviewedAt(LocalDateTime.now());
        if (req.getAdminNotes() != null) cp.setAdminNotes(req.getAdminNotes());
        return CompanyProfileResponse.from(profileRepo.save(cp));
    }

    // ── Admin: SUSPEND ────────────────────────────────────────────────

    @Transactional
    public CompanyProfileResponse suspend(Long profileId, Long adminUserId,
                                          VerificationActionRequest req) {
        if (req.getReason() == null || req.getReason().isBlank()) {
            throw new IllegalArgumentException("A suspension reason is required.");
        }
        CompanyProfile cp = loadProfile(profileId);
        cp.setVerificationStatus(VerificationStatus.SUSPENDED);
        cp.setRejectionReason(req.getReason());
        cp.setReviewedByAdminId(adminUserId);
        cp.setReviewedAt(LocalDateTime.now());
        if (req.getAdminNotes() != null) cp.setAdminNotes(req.getAdminNotes());
        return CompanyProfileResponse.from(profileRepo.save(cp));
    }

    // ── Company: re-submit after NEEDS_INFORMATION ────────────────────

    @Transactional
    public CompanyProfileResponse resubmit(String recruiterEmail) {
        User user = userRepo.findByEmail(recruiterEmail)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found: " + recruiterEmail));
        CompanyProfile cp = profileRepo.findByUser(user)
                .orElseThrow(() -> new IllegalStateException(
                        "Company profile not found for: " + recruiterEmail));
        if (cp.getVerificationStatus() != VerificationStatus.NEEDS_INFORMATION) {
            throw new IllegalArgumentException(
                    "Resubmission is only allowed when status is NEEDS_INFORMATION.");
        }
        cp.setVerificationStatus(VerificationStatus.PENDING);
        return CompanyProfileResponse.from(profileRepo.save(cp));
    }

    // ── Job posting guard (called from RecruiterController) ──────────

    /**
     * Returns true only when the authenticated recruiter's company profile
     * has been VERIFIED by an admin.  All other statuses are blocked.
     * This check is done server-side on every job creation request so the
     * frontend cannot bypass it.
     */
    @Transactional(readOnly = true)
    public boolean isEligibleToPostJobs(String recruiterEmail) {
        User user = userRepo.findByEmail(recruiterEmail)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found: " + recruiterEmail));
        return profileRepo.findByUser(user)
                .map(cp -> cp.getVerificationStatus() == VerificationStatus.VERIFIED)
                .orElse(false);
    }

    // ── Private helpers ───────────────────────────────────────────────

    private CompanyProfile loadProfile(Long id) {
        return profileRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Company profile not found: " + id));
    }
}
