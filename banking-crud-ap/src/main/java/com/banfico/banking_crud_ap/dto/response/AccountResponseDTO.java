package com.banfico.banking_crud_ap.dto.response;

import lombok.Data;

@Data
public class AccountResponseDTO {

    private Long id;

    private String accountNumber;

    private String accountType;

    private Double balance;

    private Long customerId;

    private String customerName;
}