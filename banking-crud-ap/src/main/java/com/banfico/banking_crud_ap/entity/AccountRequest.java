package com.banfico.banking_crud_ap.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Represents a customer's application for an additional bank account.
 * Created by CUSTOMER with status PENDING_APPROVAL.
 * Approved or rejected by ADMIN.
 * On approval, a real Account record is created automatically.
 */
@Entity
@Table(name = "account_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Type of account requested — SAVINGS, CURRENT, FIXED_DEPOSIT
    @Column(nullable = false)
    private String accountType;

    // Optional reason or note from the customer
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(30) default 'PENDING_APPROVAL'")
    private AccountRequestStatus status;

    // The customer who submitted this request
    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    // Populated when the request is approved — links to the created account
    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;

    // Admin's reason when rejecting (optional)
    private String rejectionReason;

    private LocalDateTime requestedAt;
    private LocalDateTime reviewedAt;

    @PrePersist
    public void prePersist() {
        requestedAt = LocalDateTime.now();
        if (status == null) status = AccountRequestStatus.PENDING_APPROVAL;
    }
}
