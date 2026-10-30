package com.hirebridge.repository;

import com.hirebridge.model.CompanyProfile;
import com.hirebridge.model.User;
import com.hirebridge.model.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyProfileRepository extends JpaRepository<CompanyProfile, Long> {

    Optional<CompanyProfile> findByUser(User user);

    boolean existsByUser(User user);

    // ── Admin verification queries ────────────────────────────────────

    /** All company profiles ordered by registration date (newest first). */
    List<CompanyProfile> findAllByOrderByCreatedAtDesc();

    /** Filter by a specific verification status. */
    List<CompanyProfile> findByVerificationStatusOrderByCreatedAtDesc(VerificationStatus status);

    /** Count profiles by status – used for dashboard stats. */
    long countByVerificationStatus(VerificationStatus status);

    /**
     * Load the profile of the authenticated recruiter together with the
     * owning User in a single query (avoids N+1 on the LAZY join).
     */
    @Query("SELECT cp FROM CompanyProfile cp JOIN FETCH cp.user u WHERE u.email = :email")
    Optional<CompanyProfile> findByUserEmailFetch(String email);
}
