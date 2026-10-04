package com.banfico.banking_crud_ap.service.impl;

import com.banfico.banking_crud_ap.dto.request.AccountRequestDTO;
import com.banfico.banking_crud_ap.dto.response.AccountRequestResponseDTO;
import com.banfico.banking_crud_ap.entity.*;
import com.banfico.banking_crud_ap.exception.ResourceNotFoundException;
import com.banfico.banking_crud_ap.repository.*;
import com.banfico.banking_crud_ap.service.AccountRequestService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AccountRequestServiceImpl implements AccountRequestService {

    private final AccountRequestRepository accountRequestRepository;
    private final CustomerRepository       customerRepository;
    private final AccountRepository        accountRepository;

    public AccountRequestServiceImpl(
            AccountRequestRepository accountRequestRepository,
            CustomerRepository customerRepository,
            AccountRepository accountRepository) {
        this.accountRequestRepository = accountRequestRepository;
        this.customerRepository       = customerRepository;
        this.accountRepository        = accountRepository;
    }

    // ── Customer: submit request ──────────────────────────────────────────────

    @Override
    @Transactional
    public AccountRequestResponseDTO submitRequest(String keycloakId,
                                                    AccountRequestDTO request) {

        Customer customer = customerRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer profile not found"));

        AccountRequest accountRequest = AccountRequest.builder()
                .accountType(request.getAccountType())
                .notes(request.getNotes())
                .customer(customer)
                .build();

        AccountRequest saved = accountRequestRepository.save(accountRequest);
        return mapToResponse(saved);
    }

    // ── Customer: view own requests ───────────────────────────────────────────

    @Override
    public List<AccountRequestResponseDTO> getMyRequests(String keycloakId) {

        Customer customer = customerRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer profile not found"));

        return accountRequestRepository
                .findByCustomerIdOrderByRequestedAtDesc(customer.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── Admin: view pending ───────────────────────────────────────────────────

    @Override
    public List<AccountRequestResponseDTO> getAllPendingRequests() {
        return accountRequestRepository
                .findByStatusOrderByRequestedAtDesc(AccountRequestStatus.PENDING_APPROVAL)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── Admin: view all ───────────────────────────────────────────────────────

    @Override
    public List<AccountRequestResponseDTO> getAllRequests() {
        return accountRequestRepository
                .findAllByOrderByRequestedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── Admin: approve ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public AccountRequestResponseDTO approveRequest(Long requestId) {

        AccountRequest request = accountRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Account request not found"));

        if (request.getStatus() != AccountRequestStatus.PENDING_APPROVAL) {
            throw new IllegalStateException(
                    "Only PENDING_APPROVAL requests can be approved");
        }

        // Generate unique account number: "ACC" + zero-padded request ID
        String accountNumber = "ACC" + String.format("%010d", request.getId());

        // Create the real bank account
        Account account = Account.builder()
                .accountNumber(accountNumber)
                .accountType(request.getAccountType())
                .balance(0.0)
                .status(AccountStatus.ACTIVE)
                .customer(request.getCustomer())
                .build();

        Account savedAccount = accountRepository.save(account);

        // Update the request
        request.setStatus(AccountRequestStatus.APPROVED);
        request.setAccount(savedAccount);
        request.setReviewedAt(LocalDateTime.now());
        accountRequestRepository.save(request);

        return mapToResponse(request);
    }

    // ── Admin: reject ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public AccountRequestResponseDTO rejectRequest(Long requestId, String reason) {

        AccountRequest request = accountRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Account request not found"));

        if (request.getStatus() != AccountRequestStatus.PENDING_APPROVAL) {
            throw new IllegalStateException(
                    "Only PENDING_APPROVAL requests can be rejected");
        }

        request.setStatus(AccountRequestStatus.REJECTED);
        request.setRejectionReason(reason);
        request.setReviewedAt(LocalDateTime.now());
        accountRequestRepository.save(request);

        return mapToResponse(request);
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private AccountRequestResponseDTO mapToResponse(AccountRequest r) {

        AccountRequestResponseDTO dto = new AccountRequestResponseDTO();
        dto.setId(r.getId());
        dto.setAccountType(r.getAccountType());
        dto.setNotes(r.getNotes());
        dto.setStatus(r.getStatus());
        dto.setRejectionReason(r.getRejectionReason());
        dto.setRequestedAt(r.getRequestedAt());
        dto.setReviewedAt(r.getReviewedAt());
        dto.setCustomerId(r.getCustomer().getId());
        dto.setCustomerName(r.getCustomer().getFullName());
        dto.setCustomerEmail(r.getCustomer().getEmail());

        if (r.getAccount() != null) {
            dto.setAccountId(r.getAccount().getId());
            dto.setAccountNumber(r.getAccount().getAccountNumber());
        }

        return dto;
    }
}
