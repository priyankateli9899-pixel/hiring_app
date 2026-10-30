package com.hirebridge.exception;

/**
 * Thrown when a registration request uses an email that is already in use.
 */
public class DuplicateEmailException extends RuntimeException {

    public DuplicateEmailException(String email) {
        super("An account with email '" + email + "' already exists");
    }
}
