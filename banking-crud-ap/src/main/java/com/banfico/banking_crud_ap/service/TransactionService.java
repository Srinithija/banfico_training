package com.banfico.banking_crud_ap.service;

import com.banfico.banking_crud_ap.dto.request.TransactionRequestDTO;
import com.banfico.banking_crud_ap.dto.response.TransactionResponseDTO;

import java.util.List;

public interface TransactionService {

    TransactionResponseDTO createTransaction(Long accountId,
                                             TransactionRequestDTO request);

    List<TransactionResponseDTO> getTransactionsByAccount(Long accountId);

}