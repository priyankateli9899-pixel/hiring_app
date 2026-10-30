package com.hirebridge.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Student profile – stored separately from the auth User entity.
 * One-to-one with User; the foreign key lives in this table.
 * spring.jpa.hibernate.ddl-auto=update will create the table on first run.
 */
@Entity
@Table(
    name = "student_profiles",
    uniqueConstraints = @UniqueConstraint(columnNames = "user_id")
)
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Owning side of the relationship ──────────────────────────────
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // ── Academic ──────────────────────────────────────────────────────
    @Column
    private String college;

    @Column
    private String university;

    @Column
    private String degree;

    @Column
    private String branch;

    @Column
    private String currentYear;

    @Column
    private String currentSemester;

    @Column
    private String graduationYear;

    @Column
    private String cgpa;

    @Column
    private Integer activeBacklogs = 0;

    // ── Skills (stored as comma-separated strings) ────────────────────
    @Column(length = 1000)
    private String technicalSkills;

    @Column(length = 1000)
    private String programmingLanguages;

    @Column(length = 1000)
    private String preferredRoles;

    @Column(length = 500)
    private String preferredLocations;

    @Column(columnDefinition = "TEXT")
    private String experience;

    @Column(length = 50)
    private String preferredWorkMode;

    // ── Resume / Links ────────────────────────────────────────────────
    @Column(length = 500)
    private String resumeFileName;

    @Column(length = 500)
    private String linkedinUrl;

    @Column(length = 500)
    private String githubUrl;

    @Column(length = 500)
    private String portfolioUrl;

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
        updatedAt  = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ── Getters & Setters ─────────────────────────────────────────────

    public Long getId()                             { return id; }
    public User getUser()                           { return user; }
    public void setUser(User user)                  { this.user = user; }
    public String getCollege()                      { return college; }
    public void setCollege(String v)                { this.college = v; }
    public String getUniversity()                   { return university; }
    public void setUniversity(String v)             { this.university = v; }
    public String getDegree()                       { return degree; }
    public void setDegree(String v)                 { this.degree = v; }
    public String getBranch()                       { return branch; }
    public void setBranch(String v)                 { this.branch = v; }
    public String getCurrentYear()                  { return currentYear; }
    public void setCurrentYear(String v)            { this.currentYear = v; }
    public String getCurrentSemester()              { return currentSemester; }
    public void setCurrentSemester(String v)        { this.currentSemester = v; }
    public String getGraduationYear()               { return graduationYear; }
    public void setGraduationYear(String v)         { this.graduationYear = v; }
    public String getCgpa()                         { return cgpa; }
    public void setCgpa(String v)                   { this.cgpa = v; }
    public Integer getActiveBacklogs()              { return activeBacklogs; }
    public void setActiveBacklogs(Integer v)        { this.activeBacklogs = v; }
    public String getTechnicalSkills()              { return technicalSkills; }
    public void setTechnicalSkills(String v)        { this.technicalSkills = v; }
    public String getProgrammingLanguages()         { return programmingLanguages; }
    public void setProgrammingLanguages(String v)   { this.programmingLanguages = v; }
    public String getPreferredRoles()               { return preferredRoles; }
    public void setPreferredRoles(String v)         { this.preferredRoles = v; }
    public String getPreferredLocations()           { return preferredLocations; }
    public void setPreferredLocations(String v)     { this.preferredLocations = v; }
    public String getExperience()                   { return experience; }
    public void setExperience(String v)             { this.experience = v; }
    public String getPreferredWorkMode()            { return preferredWorkMode; }
    public void setPreferredWorkMode(String v)      { this.preferredWorkMode = v; }
    public String getResumeFileName()               { return resumeFileName; }
    public void setResumeFileName(String v)         { this.resumeFileName = v; }
    public String getLinkedinUrl()                  { return linkedinUrl; }
    public void setLinkedinUrl(String v)            { this.linkedinUrl = v; }
    public String getGithubUrl()                    { return githubUrl; }
    public void setGithubUrl(String v)              { this.githubUrl = v; }
    public String getPortfolioUrl()                 { return portfolioUrl; }
    public void setPortfolioUrl(String v)           { this.portfolioUrl = v; }
    public boolean isProfileCompleted()             { return profileCompleted; }
    public void setProfileCompleted(boolean v)      { this.profileCompleted = v; }
    public LocalDateTime getCreatedAt()             { return createdAt; }
    public LocalDateTime getUpdatedAt()             { return updatedAt; }
}
