package com.banfico.banking_crud_ap.dto.response;

import com.banfico.banking_crud_ap.entity.AccountStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AccountResponseDTO {

    private Long id;
    private String accountNumber;
    private String accountType;
    private Double balance;
    private AccountStatus status;
    private LocalDateTime createdAt;
    private Long customerId;
    private String customerName;
}
