package com.hirebridge.dto;

import com.hirebridge.model.StudentProfile;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Response DTO – arrays are returned as proper JSON arrays split from
 * the comma-separated strings stored in the database.
 */
public class StudentProfileResponse {

    private Long    id;
    private Long    userId;
    private String  college;
    private String  university;
    private String  degree;
    private String  branch;
    private String  currentYear;
    private String  currentSemester;
    private String  graduationYear;
    private String  cgpa;
    private Integer activeBacklogs;
    private List<String> technicalSkills;
    private List<String> programmingLanguages;
    private List<String> preferredRoles;
    private List<String> preferredLocations;
    private String  experience;
    private String  preferredWorkMode;
    private String  resumeFileName;
    private String  linkedinUrl;
    private String  githubUrl;
    private String  portfolioUrl;
    private boolean profileCompleted;

    /** Factory method – converts entity to DTO. */
    public static StudentProfileResponse from(StudentProfile p) {
        StudentProfileResponse r = new StudentProfileResponse();
        r.id                  = p.getId();
        r.userId              = p.getUser().getId();
        r.college             = p.getCollege();
        r.university          = p.getUniversity();
        r.degree              = p.getDegree();
        r.branch              = p.getBranch();
        r.currentYear         = p.getCurrentYear();
        r.currentSemester     = p.getCurrentSemester();
        r.graduationYear      = p.getGraduationYear();
        r.cgpa                = p.getCgpa();
        r.activeBacklogs      = p.getActiveBacklogs();
        r.technicalSkills     = splitCsv(p.getTechnicalSkills());
        r.programmingLanguages= splitCsv(p.getProgrammingLanguages());
        r.preferredRoles      = splitCsv(p.getPreferredRoles());
        r.preferredLocations  = splitCsv(p.getPreferredLocations());
        r.experience          = p.getExperience();
        r.preferredWorkMode   = p.getPreferredWorkMode();
        r.resumeFileName      = p.getResumeFileName();
        r.linkedinUrl         = p.getLinkedinUrl();
        r.githubUrl           = p.getGithubUrl();
        r.portfolioUrl        = p.getPortfolioUrl();
        r.profileCompleted    = p.isProfileCompleted();
        return r;
    }

    private static List<String> splitCsv(String csv) {
        if (csv == null || csv.isBlank()) return Collections.emptyList();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    // Getters (Jackson needs these)

    public Long    getId()                          { return id; }
    public Long    getUserId()                      { return userId; }
    public String  getCollege()                     { return college; }
    public String  getUniversity()                  { return university; }
    public String  getDegree()                      { return degree; }
    public String  getBranch()                      { return branch; }
    public String  getCurrentYear()                 { return currentYear; }
    public String  getCurrentSemester()             { return currentSemester; }
    public String  getGraduationYear()              { return graduationYear; }
    public String  getCgpa()                        { return cgpa; }
    public Integer getActiveBacklogs()              { return activeBacklogs; }
    public List<String> getTechnicalSkills()        { return technicalSkills; }
    public List<String> getProgrammingLanguages()   { return programmingLanguages; }
    public List<String> getPreferredRoles()         { return preferredRoles; }
    public List<String> getPreferredLocations()     { return preferredLocations; }
    public String  getExperience()                  { return experience; }
    public String  getPreferredWorkMode()           { return preferredWorkMode; }
    public String  getResumeFileName()              { return resumeFileName; }
    public String  getLinkedinUrl()                 { return linkedinUrl; }
    public String  getGithubUrl()                   { return githubUrl; }
    public String  getPortfolioUrl()                { return portfolioUrl; }
    public boolean isProfileCompleted()             { return profileCompleted; }
}
