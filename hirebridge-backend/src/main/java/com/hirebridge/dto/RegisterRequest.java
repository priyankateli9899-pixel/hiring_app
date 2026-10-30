package com.hirebridge.dto;

import com.hirebridge.model.Role;
import jakarta.validation.constraints.*;

/**
 * Request body for POST /api/auth/register
 */
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Phone must be a valid 10-digit Indian mobile number")
    private String phone;

    @NotNull(message = "Role is required")
    private Role role;

    // Getters & Setters

    public String getFullName()              { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail()                 { return email; }
    public void setEmail(String email)       { this.email = email; }

    public String getPassword()              { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone()                 { return phone; }
    public void setPhone(String phone)       { this.phone = phone; }

    public Role getRole()                    { return role; }
    public void setRole(Role role)           { this.role = role; }
}
