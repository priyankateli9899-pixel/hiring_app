package com.hirebridge.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * HealthController – Phase 1
 *
 * Exposes GET /api/health to verify both the backend and the
 * PostgreSQL database are reachable.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * GET /api/health
     *
     * Executes "SELECT 1" against the configured PostgreSQL database.
     * Returns:
     *   200 OK  – both app and DB are healthy
     *   503 Service Unavailable – DB is unreachable
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new LinkedHashMap<>();
        response.put("application", "HireBridge AI");
        response.put("backend", "Running");

        try {
            // Simple connectivity check – throws if the DB is down
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            response.put("database", "Connected");
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            response.put("database", "Unavailable");
            response.put("error", ex.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }
    }
}
