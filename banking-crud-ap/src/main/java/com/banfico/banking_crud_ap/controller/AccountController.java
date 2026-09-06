package com.banfico.banking_crud_ap.controller;

import com.banfico.banking_crud_ap.dto.request.AccountRequestDTO;
import com.banfico.banking_crud_ap.dto.response.AccountResponseDTO;
import com.banfico.banking_crud_ap.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    public AccountResponseDTO createAccount(
            @Valid @RequestBody AccountRequestDTO request) {

        return accountService.createAccount(request);
    }

    @GetMapping
    public List<AccountResponseDTO> getAllAccounts() {

        return accountService.getAllAccounts();
    }

    @GetMapping("/{id}")
    public AccountResponseDTO getAccountById(@PathVariable Long id) {

        return accountService.getAccountById(id);
    }

    @PutMapping("/{id}")
    public AccountResponseDTO updateAccount(
            @PathVariable Long id,
            @Valid @RequestBody AccountRequestDTO request) {

        return accountService.updateAccount(id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteAccount(@PathVariable Long id) {

        accountService.deleteAccount(id);

        return "Account Deleted Successfully";
    }
}