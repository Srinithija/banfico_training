package com.banfico.banking_crud_ap.dto.response;

import com.banfico.banking_crud_ap.entity.AccountRequestStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AccountRequestResponseDTO {

    private Long id;
    private String accountType;
    private String notes;
    private AccountRequestStatus status;
    private Long customerId;
    private String customerName;
    private String customerEmail;

    // Populated after approval — the real account that was created
    private Long accountId;
    private String accountNumber;

    // Admin rejection reason
    private String rejectionReason;

    private LocalDateTime requestedAt;
    private LocalDateTime reviewedAt;
}
