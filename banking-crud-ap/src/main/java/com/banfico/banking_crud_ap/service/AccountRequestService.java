package com.banfico.banking_crud_ap.service;

import com.banfico.banking_crud_ap.dto.request.AccountRequestDTO;
import com.banfico.banking_crud_ap.dto.response.AccountRequestResponseDTO;

import java.util.List;

public interface AccountRequestService {

    // ── Customer actions ──────────────────────────────────────────────────────

    /** Customer submits a new account application */
    AccountRequestResponseDTO submitRequest(String keycloakId, AccountRequestDTO request);

    /** Customer views their own request history */
    List<AccountRequestResponseDTO> getMyRequests(String keycloakId);

    // ── Admin actions ─────────────────────────────────────────────────────────

    /** Admin views all pending requests */
    List<AccountRequestResponseDTO> getAllPendingRequests();

    /** Admin views all requests (any status) */
    List<AccountRequestResponseDTO> getAllRequests();

    /**
     * Admin approves a request.
     * Creates a real Account record and links it to the request.
     */
    AccountRequestResponseDTO approveRequest(Long requestId);

    /**
     * Admin rejects a request with an optional reason.
     */
    AccountRequestResponseDTO rejectRequest(Long requestId, String reason);
}
