package com.banfico.banking_crud_ap.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Staff (ADMIN) request body for directly creating a bank account.
 * Used by POST /api/accounts.
 */
@Data
public class AccountCreateDTO {

    @NotBlank
    private String accountNumber;

    @NotBlank
    private String accountType;

    @NotNull
    @Min(0)
    private Double balance;

    @NotNull
    private Long customerId;
}
