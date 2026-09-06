package com.banfico.banking_crud_ap.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CustomerResponseDTO {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private LocalDateTime createdAt;
}