package com.hirebridge.service;

import com.hirebridge.dto.CompanyProfileRequest;
import com.hirebridge.dto.CompanyProfileResponse;
import com.hirebridge.model.CompanyProfile;
import com.hirebridge.model.User;
import com.hirebridge.model.VerificationStatus;
import com.hirebridge.repository.CompanyProfileRepository;
import com.hirebridge.repository.UserRepository;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service for recruiter-facing company profile create / read / update.
 *
 * Verification status is managed by VerificationService (admin-only).
 * This service intentionally never sets verificationStatus other than
 * the initial PENDING default.
 */
@Service
public class CompanyProfileService {

    private final CompanyProfileRepository profileRepo;
    private final UserRepository           userRepo;

    public CompanyProfileService(CompanyProfileRepository profileRepo,
                                 UserRepository userRepo) {
        this.profileRepo = profileRepo;
        this.userRepo    = userRepo;
    }

    @Transactional(readOnly = true)
    public Optional<CompanyProfileResponse> getProfile(String email) {
        User user = loadUser(email);
        return profileRepo.findByUser(user).map(CompanyProfileResponse::from);
    }

    @Transactional
    public CompanyProfileResponse saveOrUpdate(String email, CompanyProfileRequest req) {
        User user = loadUser(email);

        CompanyProfile profile = profileRepo.findByUser(user)
                .orElseGet(() -> {
                    CompanyProfile p = new CompanyProfile();
                    p.setUser(user);
                    // New profiles start as PENDING – this is the only place the
                    // status is set by recruiter-initiated code.
                    p.setVerificationStatus(VerificationStatus.PENDING);
                    return p;
                });

        profile.setCompanyName(req.getCompanyName());
        profile.setIndustry(req.getIndustry());
        profile.setCompanySize(req.getCompanySize());
        profile.setWebsite(req.getWebsite());
        profile.setHqLocation(req.getHqLocation());
        profile.setLogoFileName(req.getLogoFileName());
        profile.setContactPerson(req.getContactPerson());
        profile.setDesignation(req.getDesignation());
        profile.setContactPhone(req.getContactPhone());
        profile.setDescription(req.getDescription());
        profile.setAbout(req.getAbout());
        profile.setRecruitmentEmail(req.getRecruitmentEmail());
        profile.setLinkedinUrl(req.getLinkedinUrl());
        profile.setProfileCompleted(true);

        // NOTE: Never set verificationStatus here – only VerificationService
        // (admin-facing) may change it.  PENDING is kept if this is the first
        // save; existing approved/rejected/suspended status is preserved on update.

        return CompanyProfileResponse.from(profileRepo.save(profile));
    }

    private User loadUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found: " + email));
    }
}
