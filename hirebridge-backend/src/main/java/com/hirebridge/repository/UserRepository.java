package com.hirebridge.repository;

import com.hirebridge.model.Role;
import com.hirebridge.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /** Used by AdminInitializer to check whether an admin row already exists. */
    boolean existsByRole(Role role);
}
