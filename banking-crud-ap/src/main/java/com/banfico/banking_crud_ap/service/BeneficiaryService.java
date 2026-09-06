package com.banfico.banking_crud_ap.service;

import com.banfico.banking_crud_ap.dto.request.BeneficiaryRequestDTO;
import com.banfico.banking_crud_ap.dto.response.BeneficiaryResponseDTO;

import java.util.List;

public interface BeneficiaryService {

    BeneficiaryResponseDTO createBeneficiary(BeneficiaryRequestDTO request);

    List<BeneficiaryResponseDTO> getAllBeneficiaries();

    BeneficiaryResponseDTO getBeneficiaryById(Long id);

    List<BeneficiaryResponseDTO> getBeneficiariesByCustomer(Long customerId);

    void deleteBeneficiary(Long id);
}
