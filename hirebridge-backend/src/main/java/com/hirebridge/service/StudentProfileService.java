package com.hirebridge.service;

import com.hirebridge.dto.StudentProfileRequest;
import com.hirebridge.dto.StudentProfileResponse;
import com.hirebridge.model.StudentProfile;
import com.hirebridge.model.User;
import com.hirebridge.repository.StudentProfileRepository;
import com.hirebridge.repository.UserRepository;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for student profile create / read / update.
 *
 * The authenticated user's email is derived from the Spring Security context
 * in the controller and passed here – never from a client-supplied user ID.
 */
@Service
public class StudentProfileService {

    private static final String CSV_SEP = ",";

    private final StudentProfileRepository profileRepo;
    private final UserRepository           userRepo;

    public StudentProfileService(StudentProfileRepository profileRepo,
                                  UserRepository userRepo) {
        this.profileRepo = profileRepo;
        this.userRepo    = userRepo;
    }

    // ── GET ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Optional<StudentProfileResponse> getProfile(String email) {
        User user = loadUser(email);
        return profileRepo.findByUser(user).map(StudentProfileResponse::from);
    }

    // ── CREATE or UPDATE ──────────────────────────────────────────────

    @Transactional
    public StudentProfileResponse saveOrUpdate(String email, StudentProfileRequest req) {
        User user = loadUser(email);

        StudentProfile profile = profileRepo.findByUser(user)
                .orElseGet(() -> {
                    StudentProfile p = new StudentProfile();
                    p.setUser(user);
                    return p;
                });

        applyRequest(req, profile);
        profile.setProfileCompleted(true);

        return StudentProfileResponse.from(profileRepo.save(profile));
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private User loadUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private void applyRequest(StudentProfileRequest req, StudentProfile p) {
        p.setCollege(req.getCollege());
        p.setUniversity(req.getUniversity());
        p.setDegree(req.getDegree());
        p.setBranch(req.getBranch());
        p.setCurrentYear(req.getCurrentYear());
        p.setCurrentSemester(req.getCurrentSemester());
        p.setGraduationYear(req.getGraduationYear());
        p.setCgpa(req.getCgpa());
        p.setActiveBacklogs(req.getActiveBacklogs() != null ? req.getActiveBacklogs() : 0);
        p.setTechnicalSkills(joinList(req.getTechnicalSkills()));
        p.setProgrammingLanguages(joinList(req.getProgrammingLanguages()));
        p.setPreferredRoles(joinList(req.getPreferredRoles()));
        p.setPreferredLocations(joinList(req.getPreferredLocations()));
        p.setExperience(req.getExperience());
        p.setPreferredWorkMode(req.getPreferredWorkMode());
        p.setResumeFileName(req.getResumeFileName());
        p.setLinkedinUrl(req.getLinkedinUrl());
        p.setGithubUrl(req.getGithubUrl());
        p.setPortfolioUrl(req.getPortfolioUrl());
    }

    private String joinList(List<String> list) {
        if (list == null || list.isEmpty()) return null;
        return String.join(CSV_SEP, list);
    }
}
