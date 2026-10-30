package com.hirebridge.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for POST /api/company/profile and PUT /api/company/profile.
 */
public class CompanyProfileRequest {

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Industry is required")
    private String industry;

    @NotBlank(message = "Company size is required")
    private String companySize;

    private String website;

    @NotBlank(message = "Headquarters location is required")
    private String hqLocation;

    private String logoFileName;

    @NotBlank(message = "Contact person name is required")
    private String contactPerson;

    @NotBlank(message = "Designation is required")
    private String designation;

    private String contactPhone;

    @NotBlank(message = "Company description is required")
    private String description;

    private String about;
    private String recruitmentEmail;
    private String linkedinUrl;

    // Getters & Setters

    public String getCompanyName()                  { return companyName; }
    public void setCompanyName(String v)            { this.companyName = v; }
    public String getIndustry()                     { return industry; }
    public void setIndustry(String v)               { this.industry = v; }
    public String getCompanySize()                  { return companySize; }
    public void setCompanySize(String v)            { this.companySize = v; }
    public String getWebsite()                      { return website; }
    public void setWebsite(String v)                { this.website = v; }
    public String getHqLocation()                   { return hqLocation; }
    public void setHqLocation(String v)             { this.hqLocation = v; }
    public String getLogoFileName()                 { return logoFileName; }
    public void setLogoFileName(String v)           { this.logoFileName = v; }
    public String getContactPerson()                { return contactPerson; }
    public void setContactPerson(String v)          { this.contactPerson = v; }
    public String getDesignation()                  { return designation; }
    public void setDesignation(String v)            { this.designation = v; }
    public String getContactPhone()                 { return contactPhone; }
    public void setContactPhone(String v)           { this.contactPhone = v; }
    public String getDescription()                  { return description; }
    public void setDescription(String v)            { this.description = v; }
    public String getAbout()                        { return about; }
    public void setAbout(String v)                  { this.about = v; }
    public String getRecruitmentEmail()             { return recruitmentEmail; }
    public void setRecruitmentEmail(String v)       { this.recruitmentEmail = v; }
    public String getLinkedinUrl()                  { return linkedinUrl; }
    public void setLinkedinUrl(String v)            { this.linkedinUrl = v; }
}
