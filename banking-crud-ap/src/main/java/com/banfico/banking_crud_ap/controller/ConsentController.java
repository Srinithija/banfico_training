package com.banfico.banking_crud_ap.controller;

import com.banfico.banking_crud_ap.dto.request.ConsentRequestDTO;
import com.banfico.banking_crud_ap.dto.response.ConsentResponseDTO;
import com.banfico.banking_crud_ap.service.ConsentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consents")
public class ConsentController {

    private final ConsentService consentService;

    public ConsentController(ConsentService consentService) {
        this.consentService = consentService;
    }

    @PostMapping
    public ConsentResponseDTO createConsent(@Valid @RequestBody ConsentRequestDTO request) {
        return consentService.createConsent(request);
    }

    @GetMapping
    public List<ConsentResponseDTO> getAllConsents() {
        return consentService.getAllConsents();
    }

    @GetMapping("/{id}")
    public ConsentResponseDTO getConsentById(@PathVariable Long id) {
        return consentService.getConsentById(id);
    }

    @PutMapping("/{id}/approve")
    public ConsentResponseDTO approveConsent(@PathVariable Long id) {
        return consentService.approveConsent(id);
    }

    @PutMapping("/{id}/reject")
    public ConsentResponseDTO rejectConsent(@PathVariable Long id) {
        return consentService.rejectConsent(id);
    }
}
