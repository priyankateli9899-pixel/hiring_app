package com.hirebridge.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Admin sends this body when taking a verification action on a company.
 *
 * Required fields depend on the action type (controller validates):
 *  - approve   : remarks optional
 *  - request   : notes required
 *  - reject    : reason required
 *  - suspend   : reason required
 */
public class VerificationActionRequest {

    /** Free-text remarks / notes visible internally to admins. */
    private String adminNotes;

    /** Reason surfaced to the company (for REJECTED / SUSPENDED / NEEDS_INFORMATION). */
    private String reason;

    // Getters & Setters

    public String getAdminNotes()              { return adminNotes; }
    public void   setAdminNotes(String v)      { this.adminNotes = v; }

    public String getReason()                  { return reason; }
    public void   setReason(String v)          { this.reason = v; }
}
