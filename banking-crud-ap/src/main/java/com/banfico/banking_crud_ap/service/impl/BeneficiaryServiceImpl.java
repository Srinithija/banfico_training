package com.banfico.banking_crud_ap.service.impl;

import com.banfico.banking_crud_ap.dto.request.BeneficiaryRequestDTO;
import com.banfico.banking_crud_ap.dto.response.BeneficiaryResponseDTO;
import com.banfico.banking_crud_ap.entity.Beneficiary;
import com.banfico.banking_crud_ap.entity.BeneficiaryStatus;
import com.banfico.banking_crud_ap.entity.Customer;
import com.banfico.banking_crud_ap.exception.ResourceNotFoundException;
import com.banfico.banking_crud_ap.repository.BeneficiaryRepository;
import com.banfico.banking_crud_ap.repository.CustomerRepository;
import com.banfico.banking_crud_ap.service.BeneficiaryService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BeneficiaryServiceImpl implements BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final CustomerRepository customerRepository;

    public BeneficiaryServiceImpl(BeneficiaryRepository beneficiaryRepository,
                                   CustomerRepository customerRepository) {
        this.beneficiaryRepository = beneficiaryRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    public BeneficiaryResponseDTO createBeneficiary(BeneficiaryRequestDTO request) {

        if (request.getCustomerId() == null) {
            throw new IllegalArgumentException("Customer ID is required");
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Beneficiary beneficiary = Beneficiary.builder()
                .name(request.getName())
                .accountNumber(request.getAccountNumber())
                .bankName(request.getBankName())
                .ifscCode(request.getIfscCode())
                .email(request.getEmail())
                .phone(request.getPhone())
                .customer(customer)
                .build();

        Beneficiary saved = beneficiaryRepository.save(beneficiary);

        return mapToResponse(saved);
    }

    @Override
    public List<BeneficiaryResponseDTO> getAllBeneficiaries() {

        return beneficiaryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BeneficiaryResponseDTO getBeneficiaryById(Long id) {

        Beneficiary beneficiary = beneficiaryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found"));

        return mapToResponse(beneficiary);
    }

    @Override
    public List<BeneficiaryResponseDTO> getBeneficiariesByCustomer(Long customerId) {

        return beneficiaryRepository.findByCustomerId(customerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteBeneficiary(Long id) {

        Beneficiary beneficiary = beneficiaryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found"));

        beneficiaryRepository.delete(beneficiary);
    }

    @Override
    public BeneficiaryResponseDTO approveBeneficiary(Long id) {

        Beneficiary beneficiary = beneficiaryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found"));

        if (beneficiary.getStatus() != BeneficiaryStatus.PENDING) {
            throw new IllegalStateException("Only PENDING beneficiaries can be approved");
        }

        beneficiary.setStatus(BeneficiaryStatus.APPROVED);
        Beneficiary saved = beneficiaryRepository.save(beneficiary);

        return mapToResponse(saved);
    }

    @Override
    public BeneficiaryResponseDTO rejectBeneficiary(Long id) {

        Beneficiary beneficiary = beneficiaryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found"));

        if (beneficiary.getStatus() != BeneficiaryStatus.PENDING) {
            throw new IllegalStateException("Only PENDING beneficiaries can be rejected");
        }

        beneficiary.setStatus(BeneficiaryStatus.REJECTED);
        Beneficiary saved = beneficiaryRepository.save(beneficiary);

        return mapToResponse(saved);
    }

    private BeneficiaryResponseDTO mapToResponse(Beneficiary beneficiary) {

        BeneficiaryResponseDTO response = new BeneficiaryResponseDTO();

        response.setId(beneficiary.getId());
        response.setName(beneficiary.getName());
        response.setAccountNumber(beneficiary.getAccountNumber());
        response.setBankName(beneficiary.getBankName());
        response.setIfscCode(beneficiary.getIfscCode());
        response.setEmail(beneficiary.getEmail());
        response.setPhone(beneficiary.getPhone());
        response.setStatus(beneficiary.getStatus());
        response.setCreatedAt(beneficiary.getCreatedAt());
        response.setCustomerId(beneficiary.getCustomer().getId());
        response.setCustomerName(beneficiary.getCustomer().getFullName());

        return response;
    }
}
