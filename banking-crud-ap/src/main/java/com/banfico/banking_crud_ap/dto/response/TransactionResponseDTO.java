package com.banfico.banking_crud_ap.dto.response;

import com.banfico.banking_crud_ap.entity.Transaction;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TransactionResponseDTO {

    private Long id;

    private Double amount;

    private String transactionType;

    private LocalDateTime transactionDate;

    private Transaction.TransactionStatus status;

    private Long accountId;

}