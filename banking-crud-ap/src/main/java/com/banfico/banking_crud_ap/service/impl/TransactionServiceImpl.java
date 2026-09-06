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

        if (request.getTransactionType().equalsIgnoreCase("DEPOSIT")) {

            account.setBalance(
                    account.getBalance() + request.getAmount()
            );

        } else if (request.getTransactionType().equalsIgnoreCase("WITHDRAW")) {

            if (account.getBalance() < request.getAmount()) {

                throw new RuntimeException("Insufficient Balance");

            }

            account.setBalance(
                    account.getBalance() - request.getAmount()
            );

        }

        accountRepository.save(account);

        Transaction transaction = Transaction.builder()
                .amount(request.getAmount())
                .transactionType(request.getTransactionType())
                .account(account)
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

        response.setAccountId(
                transaction.getAccount().getId()
        );

        return response;

    }

}
