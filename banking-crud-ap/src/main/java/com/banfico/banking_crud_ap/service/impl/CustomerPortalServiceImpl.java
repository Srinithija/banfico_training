package com.banfico.banking_crud_ap.service.impl;

import com.banfico.banking_crud_ap.dto.request.BeneficiaryRequestDTO;
import com.banfico.banking_crud_ap.dto.request.TransactionRequestDTO;
import com.banfico.banking_crud_ap.dto.response.AccountResponseDTO;
import com.banfico.banking_crud_ap.dto.response.BeneficiaryResponseDTO;
import com.banfico.banking_crud_ap.dto.response.TransactionResponseDTO;
import com.banfico.banking_crud_ap.entity.*;
import com.banfico.banking_crud_ap.exception.ResourceNotFoundException;
import com.banfico.banking_crud_ap.repository.*;
import com.banfico.banking_crud_ap.service.CustomerPortalService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerPortalServiceImpl implements CustomerPortalService {

    private final CustomerRepository    customerRepository;
    private final AccountRepository     accountRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final TransactionRepository transactionRepository;

    public CustomerPortalServiceImpl(
            CustomerRepository    customerRepository,
            AccountRepository     accountRepository,
            BeneficiaryRepository beneficiaryRepository,
            TransactionRepository transactionRepository) {

        this.customerRepository    = customerRepository;
        this.accountRepository     = accountRepository;
        this.beneficiaryRepository = beneficiaryRepository;
        this.transactionRepository = transactionRepository;
    }

    // ── Identity resolution ───────────────────────────────────────────────────

    private Customer resolveCustomer(String keycloakId) {
        return customerRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer profile not found for this account"));
    }

    // ── Account ───────────────────────────────────────────────────────────────

    @Override
    public List<AccountResponseDTO> getMyAccounts(String keycloakId) {
        Customer customer = resolveCustomer(keycloakId);
        return accountRepository.findByCustomerId(customer.getId())
                .stream()
                .map(this::mapAccount)
                .collect(Collectors.toList());
    }

    // ── Beneficiaries ─────────────────────────────────────────────────────────

    @Override
    public List<BeneficiaryResponseDTO> getMyBeneficiaries(String keycloakId) {
        Customer customer = resolveCustomer(keycloakId);
        return beneficiaryRepository.findByCustomerId(customer.getId())
                .stream()
                .map(this::mapBeneficiary)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BeneficiaryResponseDTO addMyBeneficiary(String keycloakId,
                                                    BeneficiaryRequestDTO request) {
        Customer customer = resolveCustomer(keycloakId);

        Beneficiary beneficiary = Beneficiary.builder()
                .name(request.getName())
                .accountNumber(request.getAccountNumber())
                .bankName(request.getBankName())
                .ifscCode(request.getIfscCode())
                .email(request.getEmail())
                .phone(request.getPhone())
                .customer(customer)
                .build();

        // @PrePersist sets PENDING — override to APPROVED (no Maker-Checker)
        Beneficiary saved = beneficiaryRepository.save(beneficiary);
        saved.setStatus(BeneficiaryStatus.APPROVED);
        saved = beneficiaryRepository.save(saved);

        return mapBeneficiary(saved);
    }

    @Override
    @Transactional
    public void deleteMyBeneficiary(String keycloakId, Long beneficiaryId) {

        Customer customer = resolveCustomer(keycloakId);

        Beneficiary beneficiary = beneficiaryRepository.findById(beneficiaryId)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found"));

        // Ownership check — customer can only delete their own beneficiaries
        if (!beneficiary.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalStateException(
                    "You are not authorised to delete this beneficiary");
        }

        beneficiaryRepository.delete(beneficiary);
    }

    // ── Transactions ──────────────────────────────────────────────────────────

    @Override
    public List<TransactionResponseDTO> getMyTransactions(String keycloakId) {
        Customer customer = resolveCustomer(keycloakId);
        Account account = accountRepository.findByCustomerId(customer.getId())
                .stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No account found"));
        return transactionRepository.findByAccountId(account.getId())
                .stream()
                .map(this::mapTransaction)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TransactionResponseDTO makeTransaction(String keycloakId,
                                                   TransactionRequestDTO request) {
        Customer customer = resolveCustomer(keycloakId);
        Account account = accountRepository.findByCustomerId(customer.getId())
                .stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No account found"));

        String type = request.getTransactionType().toUpperCase();

        if (type.equals("DEPOSIT")) {
            account.setBalance(account.getBalance() + request.getAmount());
        } else if (type.equals("WITHDRAW")) {
            if (account.getBalance() < request.getAmount()) {
                throw new IllegalStateException("Insufficient balance for withdrawal");
            }
            account.setBalance(account.getBalance() - request.getAmount());
        } else {
            throw new IllegalArgumentException(
                    "Invalid transaction type: " + request.getTransactionType() +
                    ". Allowed: DEPOSIT, WITHDRAW");
        }

        accountRepository.save(account);

        Transaction transaction = Transaction.builder()
                .amount(request.getAmount())
                .transactionType(request.getTransactionType())
                .status(TransactionStatus.APPROVED)
                .account(account)
                .build();

        return mapTransaction(transactionRepository.save(transaction));
    }

    /**
     * Transfers money to a saved beneficiary (one-click payout).
     *
     * Flow:
     *  1. Resolve customer from JWT
     *  2. Find the beneficiary — verify it belongs to this customer
     *  3. Verify beneficiary is APPROVED (not PENDING or REJECTED)
     *  4. Validate sufficient balance
     *  5. Deduct balance from account
     *  6. Record transaction as WITHDRAW / APPROVED with beneficiary name in type
     */
    @Override
    @Transactional
    public TransactionResponseDTO transferToBeneficiary(String keycloakId,
                                                         Long beneficiaryId,
                                                         Double amount) {

        Customer customer = resolveCustomer(keycloakId);

        // Fetch the beneficiary
        Beneficiary beneficiary = beneficiaryRepository.findById(beneficiaryId)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found"));

        // Ownership check — customer can only pay their own beneficiaries
        if (!beneficiary.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalStateException(
                    "You are not authorised to transfer to this beneficiary");
        }

        // Only APPROVED beneficiaries can receive transfers
        if (beneficiary.getStatus() != BeneficiaryStatus.APPROVED) {
            throw new IllegalStateException(
                    "Transfers can only be made to APPROVED beneficiaries");
        }

        // Get customer's account
        Account account = accountRepository.findByCustomerId(customer.getId())
                .stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No account found"));

        // Balance check
        if (account.getBalance() < amount) {
            throw new IllegalStateException(
                    "Insufficient balance. Available: ₹" +
                    String.format("%.2f", account.getBalance()) +
                    ", Requested: ₹" + String.format("%.2f", amount));
        }

        // Deduct balance
        account.setBalance(account.getBalance() - amount);
        accountRepository.save(account);

        // Record transaction — type includes beneficiary name for audit trail
        String txType = "TRANSFER TO " + beneficiary.getName().toUpperCase();

        Transaction transaction = Transaction.builder()
                .amount(amount)
                .transactionType(txType)
                .status(TransactionStatus.APPROVED)
                .account(account)
                .build();

        return mapTransaction(transactionRepository.save(transaction));
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private AccountResponseDTO mapAccount(Account account) {
        AccountResponseDTO dto = new AccountResponseDTO();
        dto.setId(account.getId());
        dto.setAccountNumber(account.getAccountNumber());
        dto.setAccountType(account.getAccountType());
        dto.setBalance(account.getBalance());
        dto.setStatus(account.getStatus());
        dto.setCreatedAt(account.getCreatedAt());
        dto.setCustomerId(account.getCustomer().getId());
        dto.setCustomerName(account.getCustomer().getFullName());
        return dto;
    }

    private BeneficiaryResponseDTO mapBeneficiary(Beneficiary b) {
        BeneficiaryResponseDTO dto = new BeneficiaryResponseDTO();
        dto.setId(b.getId());
        dto.setName(b.getName());
        dto.setAccountNumber(b.getAccountNumber());
        dto.setBankName(b.getBankName());
        dto.setIfscCode(b.getIfscCode());
        dto.setEmail(b.getEmail());
        dto.setPhone(b.getPhone());
        dto.setStatus(b.getStatus());
        dto.setCreatedAt(b.getCreatedAt());
        dto.setCustomerId(b.getCustomer().getId());
        dto.setCustomerName(b.getCustomer().getFullName());
        return dto;
    }

    private TransactionResponseDTO mapTransaction(Transaction t) {
        TransactionResponseDTO dto = new TransactionResponseDTO();
        dto.setId(t.getId());
        dto.setAmount(t.getAmount());
        dto.setTransactionType(t.getTransactionType());
        dto.setTransactionDate(t.getTransactionDate());
        dto.setStatus(t.getStatus() != null ? t.getStatus() : TransactionStatus.APPROVED);
        dto.setAccountId(t.getAccount().getId());
        return dto;
    }
}
