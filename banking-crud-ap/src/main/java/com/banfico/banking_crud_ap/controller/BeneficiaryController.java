package com.banfico.banking_crud_ap.controller;

import com.banfico.banking_crud_ap.dto.request.BeneficiaryRequestDTO;
import com.banfico.banking_crud_ap.dto.response.BeneficiaryResponseDTO;
import com.banfico.banking_crud_ap.service.BeneficiaryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beneficiaries")
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    public BeneficiaryController(BeneficiaryService beneficiaryService) {
        this.beneficiaryService = beneficiaryService;
    }

    @PostMapping
    public BeneficiaryResponseDTO createBeneficiary(
            @Valid @RequestBody BeneficiaryRequestDTO request) {

        return beneficiaryService.createBeneficiary(request);
    }

    @GetMapping
    public List<BeneficiaryResponseDTO> getAllBeneficiaries() {

        return beneficiaryService.getAllBeneficiaries();
    }

    @GetMapping("/{id}")
    public BeneficiaryResponseDTO getBeneficiaryById(@PathVariable Long id) {

        return beneficiaryService.getBeneficiaryById(id);
    }

    @GetMapping("/customer/{customerId}")
    public List<BeneficiaryResponseDTO> getBeneficiariesByCustomer(
            @PathVariable Long customerId) {

        return beneficiaryService.getBeneficiariesByCustomer(customerId);
    }

    @DeleteMapping("/{id}")
    public String deleteBeneficiary(@PathVariable Long id) {

        beneficiaryService.deleteBeneficiary(id);

        return "Beneficiary deleted successfully";
    }
}
