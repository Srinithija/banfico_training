package com.banfico.banking_crud_ap.service;

import com.banfico.banking_crud_ap.dto.request.ConsentRequestDTO;
import com.banfico.banking_crud_ap.dto.response.ConsentResponseDTO;

import java.util.List;

public interface ConsentService {

    ConsentResponseDTO createConsent(ConsentRequestDTO request);

    List<ConsentResponseDTO> getAllConsents();

    ConsentResponseDTO getConsentById(Long id);

    ConsentResponseDTO approveConsent(Long id);

    ConsentResponseDTO rejectConsent(Long id);
}
