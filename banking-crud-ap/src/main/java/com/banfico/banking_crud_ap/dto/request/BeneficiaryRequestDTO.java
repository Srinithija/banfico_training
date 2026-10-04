package com.banfico.banking_crud_ap.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class BeneficiaryRequestDTO {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Account number is required")
    private String accountNumber;

    @NotBlank(message = "Bank name is required")
    private String bankName;

    @NotBlank(message = "IFSC code is required")
    private String ifscCode;

    @Email
    @NotBlank(message = "Email is required")
    private String email;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must contain exactly 10 digits")
    private String phone;

    // Optional for customer portal — the backend resolves customerId from the JWT.
    // Required for staff (MAKER) flow — BeneficiaryServiceImpl uses this value.
    // Validation is done in the service layer for staff, not at DTO level.
    private Long customerId;
}
