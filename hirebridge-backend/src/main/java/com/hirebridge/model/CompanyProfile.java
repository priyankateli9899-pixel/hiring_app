package com.hirebridge.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Company profile – stored separately from the auth User entity.
 * One-to-one with User; the foreign key lives in this table.
 *
 * ddl-auto=update adds the new verification columns on first startup.
 * Existing rows get default values (status=PENDING, verified=false).
 */
@Entity
@Table(
    name = "company_profiles",
    uniqueConstraints = @UniqueConstraint(columnNames = "user_id")
)
public class CompanyProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // ── Basic company details ─────────────────────────────────────────
    @Column
    private String companyName;

    @Column(length = 100)
    private String industry;

    @Column(length = 50)
    private String companySize;

    @Column(length = 500)
    private String website;

    @Column(length = 200)
    private String hqLocation;

    @Column(length = 500)
    private String logoFileName;

    // ── Contact & recruitment info ────────────────────────────────────
    @Column
    private String contactPerson;

    @Column(length = 100)
    private String designation;

    @Column(length = 30)
    private String contactPhone;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String about;

    @Column
    private String recruitmentEmail;

    @Column(length = 500)
    private String linkedinUrl;

    // ── Verification ──────────────────────────────────────────────────

    /**
     * Full lifecycle status.  Replaces the old binary `verified` boolean
     * (which is kept below for backward-compatibility with the old DTO).
     * New code MUST read/write this field; `verified` is derived from it.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", length = 30, nullable = false,
            columnDefinition = "VARCHAR(30)")
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    /** Legacy helper – derived from verificationStatus. */
    @Column(nullable = false)
    private boolean verified = false;

    /** Admin's internal review notes / checklist remarks. */
    @Column(columnDefinition = "TEXT")
    private String adminNotes;

    /** Reason shown to the company when status = REJECTED or SUSPENDED. */
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    /** User ID of the admin who last changed the verification status. */
    @Column
    private Long reviewedByAdminId;

    /** When the admin last acted on this profile. */
    @Column
    private LocalDateTime reviewedAt;

    // ── Meta ──────────────────────────────────────────────────────────
    @Column(nullable = false)
    private boolean profileCompleted = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        // Ensure status is consistent on first persist
        syncVerifiedFlag();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        syncVerifiedFlag();
    }

    /** Keep the legacy `verified` boolean in sync with `verificationStatus`. */
    private void syncVerifiedFlag() {
        this.verified = (this.verificationStatus == VerificationStatus.VERIFIED);
    }

    // ── Getters & Setters ─────────────────────────────────────────────

    public Long getId()                              { return id; }
    public User getUser()                            { return user; }
    public void setUser(User user)                   { this.user = user; }

    public String getCompanyName()                   { return companyName; }
    public void setCompanyName(String v)             { this.companyName = v; }
    public String getIndustry()                      { return industry; }
    public void setIndustry(String v)                { this.industry = v; }
    public String getCompanySize()                   { return companySize; }
    public void setCompanySize(String v)             { this.companySize = v; }
    public String getWebsite()                       { return website; }
    public void setWebsite(String v)                 { this.website = v; }
    public String getHqLocation()                    { return hqLocation; }
    public void setHqLocation(String v)              { this.hqLocation = v; }
    public String getLogoFileName()                  { return logoFileName; }
    public void setLogoFileName(String v)            { this.logoFileName = v; }

    public String getContactPerson()                 { return contactPerson; }
    public void setContactPerson(String v)           { this.contactPerson = v; }
    public String getDesignation()                   { return designation; }
    public void setDesignation(String v)             { this.designation = v; }
    public String getContactPhone()                  { return contactPhone; }
    public void setContactPhone(String v)            { this.contactPhone = v; }
    public String getDescription()                   { return description; }
    public void setDescription(String v)             { this.description = v; }
    public String getAbout()                         { return about; }
    public void setAbout(String v)                   { this.about = v; }
    public String getRecruitmentEmail()              { return recruitmentEmail; }
    public void setRecruitmentEmail(String v)        { this.recruitmentEmail = v; }
    public String getLinkedinUrl()                   { return linkedinUrl; }
    public void setLinkedinUrl(String v)             { this.linkedinUrl = v; }

    public VerificationStatus getVerificationStatus()            { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus v)      { this.verificationStatus = v; syncVerifiedFlag(); }
    public boolean isVerified()                                  { return verified; }

    public String getAdminNotes()                    { return adminNotes; }
    public void setAdminNotes(String v)              { this.adminNotes = v; }
    public String getRejectionReason()               { return rejectionReason; }
    public void setRejectionReason(String v)         { this.rejectionReason = v; }
    public Long getReviewedByAdminId()               { return reviewedByAdminId; }
    public void setReviewedByAdminId(Long v)         { this.reviewedByAdminId = v; }
    public LocalDateTime getReviewedAt()             { return reviewedAt; }
    public void setReviewedAt(LocalDateTime v)       { this.reviewedAt = v; }

    public boolean isProfileCompleted()              { return profileCompleted; }
    public void setProfileCompleted(boolean v)       { this.profileCompleted = v; }
    public LocalDateTime getCreatedAt()              { return createdAt; }
    public LocalDateTime getUpdatedAt()              { return updatedAt; }
}
