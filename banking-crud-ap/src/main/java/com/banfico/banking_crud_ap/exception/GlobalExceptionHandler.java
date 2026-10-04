package com.banfico.banking_crud_ap.exception;

import com.banfico.banking_crud_ap.dto.response.ErrorResponse;
import jakarta.ws.rs.NotAuthorizedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── 404 Not Found ─────────────────────────────────────────────────────────
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ErrorResponse.builder()
                        .status(HttpStatus.NOT_FOUND.value())
                        .message(ex.getMessage())
                        .errors(Collections.emptyList())
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    // ── 400 Validation ────────────────────────────────────────────────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex) {

        List<String> errors = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ErrorResponse.builder()
                        .status(HttpStatus.BAD_REQUEST.value())
                        .message("Validation failed")
                        .errors(errors)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    // ── 400 Business logic (IllegalStateException, IllegalArgumentException) ──
    @ExceptionHandler({IllegalStateException.class, IllegalArgumentException.class})
    public ResponseEntity<ErrorResponse> handleIllegalState(RuntimeException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ErrorResponse.builder()
                        .status(HttpStatus.BAD_REQUEST.value())
                        .message(ex.getMessage())
                        .errors(Collections.emptyList())
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    // ── 503 Keycloak Admin API not reachable / wrong credentials ─────────────
    // jakarta.ws.rs.NotAuthorizedException is thrown by the Keycloak admin client
    // when the client_credentials token request returns 401 — meaning the
    // banking-backend client secret in application.properties is wrong or the
    // service account does not have manage-users role assigned in Keycloak.
    @ExceptionHandler(NotAuthorizedException.class)
    public ResponseEntity<ErrorResponse> handleKeycloakNotAuthorized(
            NotAuthorizedException ex) {

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                ErrorResponse.builder()
                        .status(HttpStatus.SERVICE_UNAVAILABLE.value())
                        .message("Unable to connect to the identity service. " +
                                 "Please contact your system administrator.")
                        .errors(List.of(
                                "The banking-backend client secret may be incorrect.",
                                "Verify Keycloak → Clients → banking-backend → " +
                                "Service account roles includes manage-users."
                        ))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    // ── 400 Other RuntimeExceptions ───────────────────────────────────────────
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ErrorResponse.builder()
                        .status(HttpStatus.BAD_REQUEST.value())
                        .message(ex.getMessage())
                        .errors(Collections.emptyList())
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    // ── 500 Unexpected ────────────────────────────────────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex) {

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ErrorResponse.builder()
                        .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                        .message("An unexpected error occurred")
                        .errors(Collections.emptyList())
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}
