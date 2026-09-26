package com.banfico.banking_crud_ap.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ConsentRequestDTO {

    @NotBlank(message = "Purpose is required")
    private String purpose;

    @NotNull(message = "Customer ID is required")
    private Long customerId;
}
