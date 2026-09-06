package com.banfico.banking_crud_ap.service.impl;

import com.banfico.banking_crud_ap.dto.request.AccountRequestDTO;
import com.banfico.banking_crud_ap.dto.response.AccountResponseDTO;
import com.banfico.banking_crud_ap.entity.Account;
import com.banfico.banking_crud_ap.entity.Customer;
import com.banfico.banking_crud_ap.exception.ResourceNotFoundException;
import com.banfico.banking_crud_ap.repository.AccountRepository;
import com.banfico.banking_crud_ap.repository.CustomerRepository;
import com.banfico.banking_crud_ap.service.AccountService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;

    public AccountServiceImpl(AccountRepository accountRepository,
                              CustomerRepository customerRepository) {

        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    public AccountResponseDTO createAccount(AccountRequestDTO request) {

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer Not Found"));

        Account account = Account.builder()
                .accountNumber(request.getAccountNumber())
                .accountType(request.getAccountType())
                .balance(request.getBalance())
                .customer(customer)
                .build();

        Account savedAccount = accountRepository.save(account);

        return mapToResponse(savedAccount);
    }

    @Override
    public List<AccountResponseDTO> getAllAccounts() {

        return accountRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AccountResponseDTO getAccountById(Long id) {

        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account Not Found"));

        return mapToResponse(account);
    }

    @Override
    public AccountResponseDTO updateAccount(Long id,
                                            AccountRequestDTO request) {

        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account Not Found"));

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer Not Found"));

        account.setAccountNumber(request.getAccountNumber());
        account.setAccountType(request.getAccountType());
        account.setBalance(request.getBalance());
        account.setCustomer(customer);

        Account updatedAccount = accountRepository.save(account);

        return mapToResponse(updatedAccount);
    }

    @Override
    public void deleteAccount(Long id) {

        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account Not Found"));

        accountRepository.delete(account);
    }

    private AccountResponseDTO mapToResponse(Account account) {

        AccountResponseDTO response = new AccountResponseDTO();

        response.setId(account.getId());
        response.setAccountNumber(account.getAccountNumber());
        response.setAccountType(account.getAccountType());
        response.setBalance(account.getBalance());

        response.setCustomerId(account.getCustomer().getId());
        response.setCustomerName(account.getCustomer().getFullName());

        return response;
    }
}
