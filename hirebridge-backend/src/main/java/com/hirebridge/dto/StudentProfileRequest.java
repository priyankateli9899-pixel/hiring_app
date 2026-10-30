package com.hirebridge.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

/**
 * Request DTO for POST /api/student/profile and PUT /api/student/profile.
 * Arrays are sent as JSON arrays; skills stored as comma-separated in the DB.
 */
public class StudentProfileRequest {

    @NotBlank(message = "College name is required")
    private String college;

    @NotBlank(message = "University is required")
    private String university;

    @NotBlank(message = "Degree is required")
    private String degree;

    @NotBlank(message = "Branch is required")
    private String branch;

    @NotBlank(message = "Current year is required")
    private String currentYear;

    private String currentSemester;

    @NotBlank(message = "Graduation year is required")
    private String graduationYear;

    private String cgpa;
    private Integer activeBacklogs;

    // Arrays from the tag inputs
    private List<String> technicalSkills;
    private List<String> programmingLanguages;
    private List<String> preferredRoles;
    private List<String> preferredLocations;
    private String experience;
    private String preferredWorkMode;

    // Links (resume file upload handled separately if needed)
    private String resumeFileName;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;

    // Getters & Setters

    public String getCollege()                          { return college; }
    public void setCollege(String v)                    { this.college = v; }
    public String getUniversity()                       { return university; }
    public void setUniversity(String v)                 { this.university = v; }
    public String getDegree()                           { return degree; }
    public void setDegree(String v)                     { this.degree = v; }
    public String getBranch()                           { return branch; }
    public void setBranch(String v)                     { this.branch = v; }
    public String getCurrentYear()                      { return currentYear; }
    public void setCurrentYear(String v)                { this.currentYear = v; }
    public String getCurrentSemester()                  { return currentSemester; }
    public void setCurrentSemester(String v)            { this.currentSemester = v; }
    public String getGraduationYear()                   { return graduationYear; }
    public void setGraduationYear(String v)             { this.graduationYear = v; }
    public String getCgpa()                             { return cgpa; }
    public void setCgpa(String v)                       { this.cgpa = v; }
    public Integer getActiveBacklogs()                  { return activeBacklogs; }
    public void setActiveBacklogs(Integer v)            { this.activeBacklogs = v; }
    public List<String> getTechnicalSkills()            { return technicalSkills; }
    public void setTechnicalSkills(List<String> v)      { this.technicalSkills = v; }
    public List<String> getProgrammingLanguages()       { return programmingLanguages; }
    public void setProgrammingLanguages(List<String> v) { this.programmingLanguages = v; }
    public List<String> getPreferredRoles()             { return preferredRoles; }
    public void setPreferredRoles(List<String> v)       { this.preferredRoles = v; }
    public List<String> getPreferredLocations()         { return preferredLocations; }
    public void setPreferredLocations(List<String> v)   { this.preferredLocations = v; }
    public String getExperience()                       { return experience; }
    public void setExperience(String v)                 { this.experience = v; }
    public String getPreferredWorkMode()                { return preferredWorkMode; }
    public void setPreferredWorkMode(String v)          { this.preferredWorkMode = v; }
    public String getResumeFileName()                   { return resumeFileName; }
    public void setResumeFileName(String v)             { this.resumeFileName = v; }
    public String getLinkedinUrl()                      { return linkedinUrl; }
    public void setLinkedinUrl(String v)                { this.linkedinUrl = v; }
    public String getGithubUrl()                        { return githubUrl; }
    public void setGithubUrl(String v)                  { this.githubUrl = v; }
    public String getPortfolioUrl()                     { return portfolioUrl; }
    public void setPortfolioUrl(String v)               { this.portfolioUrl = v; }
}
