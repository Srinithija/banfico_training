package com.banfico.banking_crud_ap.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TransactionResponseDTO {

    private Long id;

    private Double amount;

    private String transactionType;

    private LocalDateTime transactionDate;

    private Long accountId;

}