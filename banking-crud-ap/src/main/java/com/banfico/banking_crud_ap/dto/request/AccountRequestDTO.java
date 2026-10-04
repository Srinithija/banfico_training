package com.banfico.banking_crud_ap.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request body for customer submitting an account application.
 * customerId is resolved from JWT — not required in body.
 */
@Data
public class AccountRequestDTO {

    @NotBlank(message = "Account type is required")
    private String accountType;   // SAVINGS, CURRENT, FIXED_DEPOSIT

    private String notes;          // optional reason/note from customer
}
