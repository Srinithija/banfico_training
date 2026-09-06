package com.banfico.banking_crud_ap.service;

import com.banfico.banking_crud_ap.dto.request.AccountRequestDTO;
import com.banfico.banking_crud_ap.dto.response.AccountResponseDTO;

import java.util.List;

public interface AccountService {

    AccountResponseDTO createAccount(AccountRequestDTO request);

    List<AccountResponseDTO> getAllAccounts();

    AccountResponseDTO getAccountById(Long id);

    AccountResponseDTO updateAccount(Long id, AccountRequestDTO request);

    void deleteAccount(Long id);

}