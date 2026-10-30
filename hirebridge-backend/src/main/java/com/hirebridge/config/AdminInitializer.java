package com.hirebridge.config;

import com.hirebridge.model.Role;
import com.hirebridge.model.User;
import com.hirebridge.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * AdminInitializer – runs once on every application startup.
 *
 * ── PURPOSE ─────────────────────────────────────────────────────────────
 * Creates the first ADMIN account when none exists in the database.
 * This is the secure seeding mechanism described in Role.java.
 *
 * ── CREDENTIALS ─────────────────────────────────────────────────────────
 * Admin credentials are read through Spring's @Value mechanism, which
 * resolves properties in this order (highest → lowest priority):
 *
 *   1. OS environment variables         ADMIN_EMAIL / ADMIN_PASSWORD
 *   2. JVM system properties            -DADMIN_EMAIL=... -DADMIN_PASSWORD=...
 *   3. application.properties defaults  app.admin.email / app.admin.password
 *
 * The property names used are:
 *   app.admin.email    → bound to env var ADMIN_EMAIL  (Spring auto-relaxes)
 *   app.admin.password → bound to env var ADMIN_PASSWORD
 *
 * ── SECURITY RULES ───────────────────────────────────────────────────────
 * 1. Credentials are NEVER hardcoded.
 * 2. Password is stored as a BCrypt hash – never plaintext.
 * 3. The admin row is only inserted when zero ADMIN rows exist.
 * 4. Skips gracefully when credentials are not configured.
 * 5. Does NOT touch the public /api/auth/register endpoint.
 *
 * ── USAGE (PowerShell) ───────────────────────────────────────────────────
 *
 *   Option A – OS environment variables (recommended for production):
 *     $env:DB_PASSWORD    = "your_db_password"
 *     $env:ADMIN_EMAIL    = "admin@hirebridge.ai"
 *     $env:ADMIN_PASSWORD = "ChangeMe@2026!"
 *     .\mvnw.cmd spring-boot:run
 *
 *   Option B – JVM system properties (useful for CI):
 *     .\mvnw.cmd spring-boot:run `
 *       -Dspring-boot.run.jvmArguments="-DADMIN_EMAIL=admin@hirebridge.ai -DADMIN_PASSWORD=ChangeMe@2026!"
 *
 *   Option C – application.properties (development convenience):
 *     app.admin.email=admin@hirebridge.ai
 *     app.admin.password=ChangeMe@2026!
 *
 * ── STARTUP MESSAGES ─────────────────────────────────────────────────────
 *   First run:
 *     [AdminInitializer] ✓ Admin account created for admin@hirebridge.ai
 *
 *   Subsequent runs:
 *     [AdminInitializer] Admin account already exists – skipping seed.
 *
 *   Missing credentials:
 *     [AdminInitializer] WARN  Skipping admin seed – credentials not configured.
 */
@Component
public class AdminInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInitializer.class);

    // Spring resolves ${ADMIN_EMAIL:} from env var ADMIN_EMAIL, JVM property
    // -DADMIN_EMAIL, or the property app.admin.email. Defaults to empty string
    // (not null) so the blank-check works cleanly.
    @Value("${ADMIN_EMAIL:${app.admin.email:}}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:${app.admin.password:}}")
    private String adminPassword;

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminInitializer(UserRepository userRepository,
                            PasswordEncoder passwordEncoder) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {

        // ── Guard: skip if an ADMIN row already exists ──────────────────
        if (userRepository.existsByRole(Role.ADMIN)) {
            log.info("[AdminInitializer] Admin account already exists – skipping seed.");
            return;
        }

        // ── Validate credentials ─────────────────────────────────────────
        if (adminEmail == null || adminEmail.isBlank()) {
            log.warn("[AdminInitializer] Admin credentials not configured – skipping seed.");
            log.warn("[AdminInitializer] To create the admin account set ADMIN_EMAIL and");
            log.warn("[AdminInitializer] ADMIN_PASSWORD via environment variable, JVM system");
            log.warn("[AdminInitializer] property (-DADMIN_EMAIL=...), or application.properties");
            log.warn("[AdminInitializer] (app.admin.email / app.admin.password).");
            return;
        }
        if (adminPassword == null || adminPassword.isBlank()) {
            log.warn("[AdminInitializer] ADMIN_PASSWORD not set – skipping admin seed.");
            return;
        }

        // ── Guard: email must not already belong to another user ─────────
        if (userRepository.existsByEmail(adminEmail)) {
            log.warn("[AdminInitializer] Email '{}' is already registered under a non-ADMIN role." +
                     " Admin seed skipped.", adminEmail);
            return;
        }

        // ── Create and persist the admin user ────────────────────────────
        User admin = new User();
        admin.setFullName("Platform Administrator");
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword)); // BCrypt
        admin.setRole(Role.ADMIN);
        admin.setActive(true);

        userRepository.save(admin);

        log.info("[AdminInitializer] ✓ Admin account created  : {}", adminEmail);
        log.info("[AdminInitializer]   Role                   : ADMIN");
        log.info("[AdminInitializer]   Active                 : true");
        log.info("[AdminInitializer]   ⚠ Change the default password after first login.");
    }
}
