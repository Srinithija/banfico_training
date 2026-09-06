package com.banfico.banking_crud_ap.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TransactionRequestDTO {

    @NotNull
    @Min(1)
    private Double amount;

    @NotBlank
    private String transactionType;

}