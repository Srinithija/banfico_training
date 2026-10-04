package com.banfico.banking_crud_ap.service.impl;

import com.banfico.banking_crud_ap.dto.request.TransactionRequestDTO;
import com.banfico.banking_crud_ap.dto.response.TransactionResponseDTO;
import com.banfico.banking_crud_ap.entity.Account;
import com.banfico.banking_crud_ap.entity.Transaction;
import com.banfico.banking_crud_ap.entity.TransactionStatus;
import com.banfico.banking_crud_ap.exception.ResourceNotFoundException;
import com.banfico.banking_crud_ap.repository.AccountRepository;
import com.banfico.banking_crud_ap.repository.TransactionRepository;
import com.banfico.banking_crud_ap.service.TransactionService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    public TransactionServiceImpl(TransactionRepository transactionRepository,
                                  AccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
    }

    @Override
    public TransactionResponseDTO createTransaction(Long accountId,
                                                    TransactionRequestDTO request) {

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account Not Found"));

        // Balance only updates on CHECKER approval — status starts PENDING
        Transaction transaction = Transaction.builder()
                .amount(request.getAmount())
                .transactionType(request.getTransactionType())
                .account(account)
                .status(TransactionStatus.PENDING)
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);
        return mapToResponse(savedTransaction);
    }

    @Override
    public List<TransactionResponseDTO> getTransactionsByAccount(Long accountId) {
        return transactionRepository.findByAccountId(accountId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TransactionResponseDTO approveTransaction(Long accountId, Long transactionId) {

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account Not Found"));

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction Not Found"));

        if (!transaction.getAccount().getId().equals(accountId)) {
            throw new IllegalStateException("Transaction does not belong to this account");
        }

        TransactionStatus currentStatus = transaction.getStatus() != null
                ? transaction.getStatus() : TransactionStatus.PENDING;

        if (currentStatus != TransactionStatus.PENDING) {
            throw new IllegalStateException("Only PENDING transactions can be approved");
        }

        if (transaction.getTransactionType().equalsIgnoreCase("DEPOSIT")) {
            account.setBalance(account.getBalance() + transaction.getAmount());
        } else if (transaction.getTransactionType().equalsIgnoreCase("WITHDRAW")) {
            if (account.getBalance() < transaction.getAmount()) {
                throw new IllegalStateException("Insufficient balance for withdrawal");
            }
            account.setBalance(account.getBalance() - transaction.getAmount());
        }

        transaction.setStatus(TransactionStatus.APPROVED);
        accountRepository.save(account);
        Transaction saved = transactionRepository.save(transaction);
        return mapToResponse(saved);
    }

    @Override
    public TransactionResponseDTO rejectTransaction(Long accountId, Long transactionId) {

        accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account Not Found"));

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction Not Found"));

        if (!transaction.getAccount().getId().equals(accountId)) {
            throw new IllegalStateException("Transaction does not belong to this account");
        }

        TransactionStatus currentStatus = transaction.getStatus() != null
                ? transaction.getStatus() : TransactionStatus.PENDING;

        if (currentStatus != TransactionStatus.PENDING) {
            throw new IllegalStateException("Only PENDING transactions can be rejected");
        }

        transaction.setStatus(TransactionStatus.REJECTED);
        Transaction saved = transactionRepository.save(transaction);
        return mapToResponse(saved);
    }

    private TransactionResponseDTO mapToResponse(Transaction transaction) {

        TransactionResponseDTO response = new TransactionResponseDTO();
        response.setId(transaction.getId());
        response.setAmount(transaction.getAmount());
        response.setTransactionType(transaction.getTransactionType());
        response.setTransactionDate(transaction.getTransactionDate());
        response.setStatus(transaction.getStatus() != null
                ? transaction.getStatus() : TransactionStatus.PENDING);
        response.setAccountId(transaction.getAccount().getId());
        return response;
    }
}
