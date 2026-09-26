package com.banfico.banking_crud_ap.service.impl;

import com.banfico.banking_crud_ap.dto.request.ConsentRequestDTO;
import com.banfico.banking_crud_ap.dto.response.ConsentResponseDTO;
import com.banfico.banking_crud_ap.entity.Consent;
import com.banfico.banking_crud_ap.entity.Customer;
import com.banfico.banking_crud_ap.exception.ResourceNotFoundException;
import com.banfico.banking_crud_ap.repository.ConsentRepository;
import com.banfico.banking_crud_ap.repository.CustomerRepository;
import com.banfico.banking_crud_ap.service.ConsentService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConsentServiceImpl implements ConsentService {

    private final ConsentRepository consentRepository;
    private final CustomerRepository customerRepository;

    public ConsentServiceImpl(ConsentRepository consentRepository,
                              CustomerRepository customerRepository) {
        this.consentRepository = consentRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    public ConsentResponseDTO createConsent(ConsentRequestDTO request) {

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Consent consent = Consent.builder()
                .purpose(request.getPurpose())
                .status(Consent.ConsentStatus.PENDING)
                .customer(customer)
                .build();

        Consent savedConsent = consentRepository.save(consent);

        return mapToResponse(savedConsent);
    }

    @Override
    public List<ConsentResponseDTO> getAllConsents() {

        return consentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ConsentResponseDTO getConsentById(Long id) {

        Consent consent = consentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consent not found"));

        return mapToResponse(consent);
    }

    @Override
    public ConsentResponseDTO approveConsent(Long id) {

        Consent consent = consentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consent not found"));

        if (consent.getStatus() != Consent.ConsentStatus.PENDING) {
            throw new RuntimeException("Only PENDING consent can be approved");
        }

        consent.setStatus(Consent.ConsentStatus.APPROVED);

        Consent updatedConsent = consentRepository.save(consent);

        return mapToResponse(updatedConsent);
    }

    @Override
    public ConsentResponseDTO rejectConsent(Long id) {

        Consent consent = consentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consent not found"));

        if (consent.getStatus() != Consent.ConsentStatus.PENDING) {
            throw new RuntimeException("Only PENDING consent can be rejected");
        }

        consent.setStatus(Consent.ConsentStatus.REJECTED);

        Consent updatedConsent = consentRepository.save(consent);

        return mapToResponse(updatedConsent);
    }

    private ConsentResponseDTO mapToResponse(Consent consent) {

        ConsentResponseDTO response = new ConsentResponseDTO();

        response.setId(consent.getId());
        response.setPurpose(consent.getPurpose());
        response.setStatus(consent.getStatus());
        response.setCreatedAt(consent.getCreatedAt());
        response.setUpdatedAt(consent.getUpdatedAt());

        if (consent.getCustomer() != null) {
            response.setCustomerId(consent.getCustomer().getId());
            response.setCustomerName(consent.getCustomer().getFullName());
        }

        return response;
    }
}
