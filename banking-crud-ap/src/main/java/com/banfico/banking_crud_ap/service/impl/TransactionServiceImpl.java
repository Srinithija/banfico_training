package com.banfico.banking_crud_ap.service.impl;

import com.banfico.banking_crud_ap.dto.request.TransactionRequestDTO;
import com.banfico.banking_crud_ap.dto.response.TransactionResponseDTO;
import com.banfico.banking_crud_ap.entity.Account;
import com.banfico.banking_crud_ap.entity.Transaction;
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
                .orElseThrow(() ->
                        new ResourceNotFoundException("Account Not Found"));

        // DO NOT update balance here - balance only updates on approval
        Transaction transaction = Transaction.builder()
                .amount(request.getAmount())
                .transactionType(request.getTransactionType())
                .account(account)
                .status(Transaction.TransactionStatus.PENDING)
                .build();

        Transaction savedTransaction =
                transactionRepository.save(transaction);

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

        // Verify transaction belongs to the account
        if (!transaction.getAccount().getId().equals(accountId)) {
            throw new RuntimeException("Transaction does not belong to this account");
        }

        // Handle existing transactions with null status (backward compatibility)
        Transaction.TransactionStatus currentStatus = transaction.getStatus();
        if (currentStatus == null) {
            currentStatus = Transaction.TransactionStatus.PENDING;
        }

        // Verify status is PENDING
        if (currentStatus != Transaction.TransactionStatus.PENDING) {
            throw new RuntimeException("Only PENDING transactions can be approved");
        }

        // Process the transaction based on type
        if (transaction.getTransactionType().equalsIgnoreCase("DEPOSIT")) {
            account.setBalance(account.getBalance() + transaction.getAmount());
        } else if (transaction.getTransactionType().equalsIgnoreCase("WITHDRAW")) {
            if (account.getBalance() < transaction.getAmount()) {
                throw new RuntimeException("Insufficient Balance for withdrawal");
            }
            account.setBalance(account.getBalance() - transaction.getAmount());
        }

        // Update transaction status
        transaction.setStatus(Transaction.TransactionStatus.APPROVED);

        // Save both
        accountRepository.save(account);
        Transaction savedTransaction = transactionRepository.save(transaction);

        return mapToResponse(savedTransaction);
    }

    @Override
    public TransactionResponseDTO rejectTransaction(Long accountId, Long transactionId) {

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account Not Found"));

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction Not Found"));

        // Verify transaction belongs to the account
        if (!transaction.getAccount().getId().equals(accountId)) {
            throw new RuntimeException("Transaction does not belong to this account");
        }

        // Handle existing transactions with null status (backward compatibility)
        Transaction.TransactionStatus currentStatus = transaction.getStatus();
        if (currentStatus == null) {
            currentStatus = Transaction.TransactionStatus.PENDING;
        }

        // Verify status is PENDING
        if (currentStatus != Transaction.TransactionStatus.PENDING) {
            throw new RuntimeException("Only PENDING transactions can be rejected");
        }

        // Update transaction status - DO NOT modify balance
        transaction.setStatus(Transaction.TransactionStatus.REJECTED);

        Transaction savedTransaction = transactionRepository.save(transaction);

        return mapToResponse(savedTransaction);
    }

    private TransactionResponseDTO mapToResponse(Transaction transaction) {

        TransactionResponseDTO response =
                new TransactionResponseDTO();

        response.setId(transaction.getId());

        response.setAmount(transaction.getAmount());

        response.setTransactionType(
                transaction.getTransactionType()
        );

        response.setTransactionDate(
                transaction.getTransactionDate()
        );

        // Handle existing transactions with null status (backward compatibility)
        response.setStatus(transaction.getStatus() != null ?
                transaction.getStatus() : Transaction.TransactionStatus.PENDING);

        response.setAccountId(
                transaction.getAccount().getId()
        );

        return response;

    }

}
