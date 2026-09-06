package com.banfico.banking_crud_ap.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AccountRequestDTO {

    @NotBlank(message = "Account Number is required")
    private String accountNumber;

    @NotBlank(message = "Account Type is required")
    private String accountType;

    @NotNull(message = "Balance is required")
    @Min(value = 0, message = "Balance cannot be negative")
    private Double balance;

    @NotNull(message = "Customer ID is required")
    private Long customerId;
}