package com.banfico.banking_crud_ap.service;

import com.banfico.banking_crud_ap.dto.request.AccountCreateDTO;
import com.banfico.banking_crud_ap.dto.response.AccountResponseDTO;

import java.util.List;

public interface AccountService {

    AccountResponseDTO createAccount(AccountCreateDTO request);

    List<AccountResponseDTO> getAllAccounts();

    AccountResponseDTO getAccountById(Long id);

    AccountResponseDTO updateAccount(Long id, AccountCreateDTO request);

    void deleteAccount(Long id);

}