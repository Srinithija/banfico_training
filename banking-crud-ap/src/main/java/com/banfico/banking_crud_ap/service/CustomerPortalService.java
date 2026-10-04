package com.banfico.banking_crud_ap.service;

import com.banfico.banking_crud_ap.dto.request.BeneficiaryRequestDTO;
import com.banfico.banking_crud_ap.dto.request.TransactionRequestDTO;
import com.banfico.banking_crud_ap.dto.response.AccountResponseDTO;
import com.banfico.banking_crud_ap.dto.response.BeneficiaryResponseDTO;
import com.banfico.banking_crud_ap.dto.response.TransactionResponseDTO;

import java.util.List;

/**
 * Self-service operations for CUSTOMER role.
 *
 * All methods receive the keycloakId extracted from the JWT "sub" claim.
 * Every query is automatically scoped to that customer's own data.
 * No Maker-Checker: customer operations are instant.
 */
public interface CustomerPortalService {

    // ── Account ───────────────────────────────────────────────────────────────

    List<AccountResponseDTO> getMyAccounts(String keycloakId);

    // ── Beneficiaries ─────────────────────────────────────────────────────────

    List<BeneficiaryResponseDTO> getMyBeneficiaries(String keycloakId);

    BeneficiaryResponseDTO addMyBeneficiary(String keycloakId,
                                            BeneficiaryRequestDTO request);

    /**
     * Removes a beneficiary from the customer's list.
     * Only the owner can delete their own beneficiary.
     */
    void deleteMyBeneficiary(String keycloakId, Long beneficiaryId);

    // ── Transactions ──────────────────────────────────────────────────────────

    List<TransactionResponseDTO> getMyTransactions(String keycloakId);

    TransactionResponseDTO makeTransaction(String keycloakId,
                                           TransactionRequestDTO request);

    /**
     * Transfers money to a saved beneficiary.
     * Validates sufficient balance before executing.
     * Records the transaction as WITHDRAW instantly (APPROVED).
     */
    TransactionResponseDTO transferToBeneficiary(String keycloakId,
                                                  Long beneficiaryId,
                                                  Double amount);
}
