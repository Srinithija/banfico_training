package com.banfico.banking_crud_ap.dto.response;

import com.banfico.banking_crud_ap.entity.Consent;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ConsentResponseDTO {

    private Long id;
    private String purpose;
    private Consent.ConsentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long customerId;
    private String customerName;
}
