package com.banfico.banking_crud_ap.controller;

import com.banfico.banking_crud_ap.dto.request.TransactionRequestDTO;
import com.banfico.banking_crud_ap.dto.response.TransactionResponseDTO;
import com.banfico.banking_crud_ap.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/{accountId}/transactions")
    public TransactionResponseDTO createTransaction(
            @PathVariable Long accountId,
            @Valid @RequestBody TransactionRequestDTO request){

        return transactionService.createTransaction(accountId,request);

    }

    @GetMapping("/{accountId}/transactions")
    public List<TransactionResponseDTO> getTransactions(
            @PathVariable Long accountId){

        return transactionService.getTransactionsByAccount(accountId);

    }

}