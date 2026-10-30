package com.hirebridge.model;

/**
 * Verification lifecycle for company accounts.
 *
 *  PENDING          → Registered, awaiting admin review
 *  UNDER_REVIEW     → Admin has opened the profile for review
 *  NEEDS_INFORMATION → Admin requested clarification / missing docs
 *  VERIFIED         → Approved – company may post jobs
 *  REJECTED         → Permanently rejected
 *  SUSPENDED        → Previously verified but suspended by admin
 */
public enum VerificationStatus {
    PENDING,
    UNDER_REVIEW,
    NEEDS_INFORMATION,
    VERIFIED,
    REJECTED,
    SUSPENDED
}
