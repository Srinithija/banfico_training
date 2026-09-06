package com.banfico.banking_crud_ap.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BeneficiaryResponseDTO {

    private Long id;
    private String name;
    private String accountNumber;
    private String bankName;
    private String ifscCode;
    private String email;
    private String phone;
    private LocalDateTime createdAt;
    private Long customerId;
    private String customerName;
}
