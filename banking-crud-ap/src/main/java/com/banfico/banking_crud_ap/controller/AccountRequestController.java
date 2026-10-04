package com.banfico.banking_crud_ap.controller;

import com.banfico.banking_crud_ap.dto.request.AccountRequestDTO;
import com.banfico.banking_crud_ap.dto.response.AccountRequestResponseDTO;
import com.banfico.banking_crud_ap.service.AccountRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Handles the account application workflow.
 *
 * CUSTOMER endpoints  — POST/GET under /api/account-requests (ROLE_CUSTOMER)
 * ADMIN endpoints     — GET/PUT under /api/account-requests/admin/** (ROLE_ADMIN)
 */
@RestController
@RequestMapping("/api/account-requests")
public class AccountRequestController {

    private final AccountRequestService accountRequestService;

    public AccountRequestController(AccountRequestService accountRequestService) {
        this.accountRequestService = accountRequestService;
    }

    // ── Customer: submit a new account application ────────────────────────────

    /**
     * POST /api/account-requests
     * Customer applies for an additional account.
     * Body: { "accountType": "CURRENT", "notes": "For business use" }
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AccountRequestResponseDTO submitRequest(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody AccountRequestDTO request) {
        return accountRequestService.submitRequest(jwt.getSubject(), request);
    }

    /**
     * GET /api/account-requests/my
     * Customer views their own request history.
     */
    @GetMapping("/my")
    public List<AccountRequestResponseDTO> getMyRequests(
            @AuthenticationPrincipal Jwt jwt) {
        return accountRequestService.getMyRequests(jwt.getSubject());
    }

    // ── Admin: manage requests ────────────────────────────────────────────────

    /**
     * GET /api/account-requests/admin/pending
     * Admin views all PENDING_APPROVAL requests.
     */
    @GetMapping("/admin/pending")
    public List<AccountRequestResponseDTO> getAllPendingRequests() {
        return accountRequestService.getAllPendingRequests();
    }

    /**
     * GET /api/account-requests/admin/all
     * Admin views all requests (any status).
     */
    @GetMapping("/admin/all")
    public List<AccountRequestResponseDTO> getAllRequests() {
        return accountRequestService.getAllRequests();
    }

    /**
     * PUT /api/account-requests/{id}/approve
     * Admin approves a pending request — creates the real bank account.
     */
    @PutMapping("/{id}/approve")
    public AccountRequestResponseDTO approveRequest(@PathVariable Long id) {
        return accountRequestService.approveRequest(id);
    }

    /**
     * PUT /api/account-requests/{id}/reject
     * Admin rejects a pending request with an optional reason.
     * Body: { "reason": "Incomplete documentation" }
     */
    @PutMapping("/{id}/reject")
    public AccountRequestResponseDTO rejectRequest(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return accountRequestService.rejectRequest(id, reason);
    }
}
