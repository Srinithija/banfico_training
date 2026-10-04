package com.banfico.banking_crud_ap.controller;

import com.banfico.banking_crud_ap.dto.request.BeneficiaryRequestDTO;
import com.banfico.banking_crud_ap.dto.request.TransactionRequestDTO;
import com.banfico.banking_crud_ap.dto.response.AccountResponseDTO;
import com.banfico.banking_crud_ap.dto.response.BeneficiaryResponseDTO;
import com.banfico.banking_crud_ap.dto.response.TransactionResponseDTO;
import com.banfico.banking_crud_ap.service.CustomerPortalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Self-service portal for CUSTOMER role.
 * All endpoints require ROLE_CUSTOMER (enforced in SecurityConfig).
 * Identity resolved from JWT "sub" claim — customers access only their own data.
 */
@RestController
@RequestMapping("/api/customer")
public class CustomerPortalController {

    private final CustomerPortalService customerPortalService;

    public CustomerPortalController(CustomerPortalService customerPortalService) {
        this.customerPortalService = customerPortalService;
    }

    private String keycloakId(Jwt jwt) {
        return jwt.getSubject();
    }

    // ── Account ───────────────────────────────────────────────────────────────

    @GetMapping("/my-account")
    public List<AccountResponseDTO> getMyAccount(@AuthenticationPrincipal Jwt jwt) {
        return customerPortalService.getMyAccounts(keycloakId(jwt));
    }

    // ── Beneficiaries ─────────────────────────────────────────────────────────

    @GetMapping("/my-beneficiaries")
    public List<BeneficiaryResponseDTO> getMyBeneficiaries(
            @AuthenticationPrincipal Jwt jwt) {
        return customerPortalService.getMyBeneficiaries(keycloakId(jwt));
    }

    @PostMapping("/my-beneficiaries")
    @ResponseStatus(HttpStatus.CREATED)
    public BeneficiaryResponseDTO addMyBeneficiary(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody BeneficiaryRequestDTO request) {
        return customerPortalService.addMyBeneficiary(keycloakId(jwt), request);
    }

    /**
     * DELETE /api/customer/my-beneficiaries/{id}
     * Removes a beneficiary from the customer's saved list.
     * Ownership is verified in the service — customers can only delete their own.
     */
    @DeleteMapping("/my-beneficiaries/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMyBeneficiary(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id) {
        customerPortalService.deleteMyBeneficiary(keycloakId(jwt), id);
    }

    // ── Transactions ──────────────────────────────────────────────────────────

    @GetMapping("/my-transactions")
    public List<TransactionResponseDTO> getMyTransactions(
            @AuthenticationPrincipal Jwt jwt) {
        return customerPortalService.getMyTransactions(keycloakId(jwt));
    }

    @PostMapping("/my-transactions")
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponseDTO makeTransaction(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody TransactionRequestDTO request) {
        return customerPortalService.makeTransaction(keycloakId(jwt), request);
    }

    /**
     * POST /api/customer/my-beneficiaries/{id}/transfer
     * One-click payout to a saved beneficiary.
     *
     * Request body: { "amount": 500.00 }
     *
     * Business rules:
     *  - Beneficiary must belong to this customer
     *  - Beneficiary must be APPROVED
     *  - Customer must have sufficient balance
     *  - Balance is deducted instantly (no Maker-Checker)
     */
    @PostMapping("/my-beneficiaries/{id}/transfer")
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponseDTO transferToBeneficiary(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @RequestBody Map<String, Double> body) {

        Double amount = body.get("amount");

        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Transfer amount must be greater than zero");
        }

        return customerPortalService.transferToBeneficiary(keycloakId(jwt), id, amount);
    }
}
