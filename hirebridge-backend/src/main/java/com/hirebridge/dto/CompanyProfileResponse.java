package com.hirebridge.dto;

import com.hirebridge.model.CompanyProfile;
import com.hirebridge.model.VerificationStatus;
import java.time.LocalDateTime;

/**
 * Response DTO returned to both companies (/api/recruiter/profile)
 * and admins (/api/admin/companies/**).
 *
 * Now includes the full verification lifecycle fields.
 */
public class CompanyProfileResponse {

    private Long               id;
    private Long               userId;
    private String             userEmail;       // from related User
    private String             userFullName;    // from related User
    private String             companyName;
    private String             industry;
    private String             companySize;
    private String             website;
    private String             hqLocation;
    private String             logoFileName;
    private String             contactPerson;
    private String             designation;
    private String             contactPhone;
    private String             description;
    private String             about;
    private String             recruitmentEmail;
    private String             linkedinUrl;
    private boolean            profileCompleted;
    private boolean            verified;
    private VerificationStatus verificationStatus;
    private String             adminNotes;
    private String             rejectionReason;
    private Long               reviewedByAdminId;
    private LocalDateTime      reviewedAt;
    private LocalDateTime      createdAt;
    private LocalDateTime      updatedAt;

    public static CompanyProfileResponse from(CompanyProfile p) {
        CompanyProfileResponse r = new CompanyProfileResponse();
        r.id                 = p.getId();
        r.userId             = p.getUser().getId();
        r.userEmail          = p.getUser().getEmail();
        r.userFullName       = p.getUser().getFullName();
        r.companyName        = p.getCompanyName();
        r.industry           = p.getIndustry();
        r.companySize        = p.getCompanySize();
        r.website            = p.getWebsite();
        r.hqLocation         = p.getHqLocation();
        r.logoFileName       = p.getLogoFileName();
        r.contactPerson      = p.getContactPerson();
        r.designation        = p.getDesignation();
        r.contactPhone       = p.getContactPhone();
        r.description        = p.getDescription();
        r.about              = p.getAbout();
        r.recruitmentEmail   = p.getRecruitmentEmail();
        r.linkedinUrl        = p.getLinkedinUrl();
        r.profileCompleted   = p.isProfileCompleted();
        r.verified           = p.isVerified();
        r.verificationStatus = p.getVerificationStatus();
        r.adminNotes         = p.getAdminNotes();
        r.rejectionReason    = p.getRejectionReason();
        r.reviewedByAdminId  = p.getReviewedByAdminId();
        r.reviewedAt         = p.getReviewedAt();
        r.createdAt          = p.getCreatedAt();
        r.updatedAt          = p.getUpdatedAt();
        return r;
    }

    // ── Getters ───────────────────────────────────────────────────────

    public Long               getId()                 { return id; }
    public Long               getUserId()             { return userId; }
    public String             getUserEmail()          { return userEmail; }
    public String             getUserFullName()        { return userFullName; }
    public String             getCompanyName()        { return companyName; }
    public String             getIndustry()           { return industry; }
    public String             getCompanySize()        { return companySize; }
    public String             getWebsite()            { return website; }
    public String             getHqLocation()         { return hqLocation; }
    public String             getLogoFileName()       { return logoFileName; }
    public String             getContactPerson()      { return contactPerson; }
    public String             getDesignation()        { return designation; }
    public String             getContactPhone()       { return contactPhone; }
    public String             getDescription()        { return description; }
    public String             getAbout()              { return about; }
    public String             getRecruitmentEmail()   { return recruitmentEmail; }
    public String             getLinkedinUrl()        { return linkedinUrl; }
    public boolean            isProfileCompleted()    { return profileCompleted; }
    public boolean            isVerified()            { return verified; }
    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public String             getAdminNotes()         { return adminNotes; }
    public String             getRejectionReason()    { return rejectionReason; }
    public Long               getReviewedByAdminId()  { return reviewedByAdminId; }
    public LocalDateTime      getReviewedAt()         { return reviewedAt; }
    public LocalDateTime      getCreatedAt()          { return createdAt; }
    public LocalDateTime      getUpdatedAt()          { return updatedAt; }
}
