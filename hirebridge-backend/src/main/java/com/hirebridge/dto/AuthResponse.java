package com.hirebridge.dto;

import com.hirebridge.model.Role;

/**
 * Response body returned by both register and login endpoints.
 */
public class AuthResponse {

    private Long   userId;
    private String fullName;
    private String email;
    private Role   role;
    private String token;
    private String message;

    // ── Constructors ──────────────────────────────────────────────────

    public AuthResponse() {}

    public AuthResponse(Long userId, String fullName, String email,
                        Role role, String token, String message) {
        this.userId   = userId;
        this.fullName = fullName;
        this.email    = email;
        this.role     = role;
        this.token    = token;
        this.message  = message;
    }

    // ── Getters & Setters ─────────────────────────────────────────────

    public Long   getUserId()                  { return userId; }
    public void   setUserId(Long userId)       { this.userId = userId; }

    public String getFullName()                { return fullName; }
    public void   setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail()                   { return email; }
    public void   setEmail(String email)       { this.email = email; }

    public Role   getRole()                    { return role; }
    public void   setRole(Role role)           { this.role = role; }

    public String getToken()                   { return token; }
    public void   setToken(String token)       { this.token = token; }

    public String getMessage()                 { return message; }
    public void   setMessage(String message)   { this.message = message; }
}
