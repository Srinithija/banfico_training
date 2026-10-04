package com.banfico.banking_crud_ap.service.impl;

import com.banfico.banking_crud_ap.dto.request.CustomerRequestDTO;
import com.banfico.banking_crud_ap.dto.response.CustomerResponseDTO;
import com.banfico.banking_crud_ap.entity.Account;
import com.banfico.banking_crud_ap.entity.AccountStatus;
import com.banfico.banking_crud_ap.entity.Customer;
import com.banfico.banking_crud_ap.exception.ResourceNotFoundException;
import com.banfico.banking_crud_ap.repository.AccountRepository;
import com.banfico.banking_crud_ap.repository.BeneficiaryRepository;
import com.banfico.banking_crud_ap.repository.CustomerRepository;
import com.banfico.banking_crud_ap.repository.TransactionRepository;
import com.banfico.banking_crud_ap.service.CustomerService;
import com.banfico.banking_crud_ap.service.KeycloakAdminService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final TransactionRepository transactionRepository;
    private final KeycloakAdminService keycloakAdminService;

    public CustomerServiceImpl(CustomerRepository customerRepository,
                               AccountRepository accountRepository,
                               BeneficiaryRepository beneficiaryRepository,
                               TransactionRepository transactionRepository,
                               KeycloakAdminService keycloakAdminService) {
        this.customerRepository    = customerRepository;
        this.accountRepository     = accountRepository;
        this.beneficiaryRepository = beneficiaryRepository;
        this.transactionRepository = transactionRepository;
        this.keycloakAdminService  = keycloakAdminService;
    }

    /**
     * Creates a Customer record, auto-creates a linked SAVINGS Account (₹0),
     * and creates a matching Keycloak user with CUSTOMER role +
     * VERIFY_EMAIL + UPDATE_PASSWORD required actions.
     *
     * @Transactional ensures that if either the account save OR the Keycloak
     * call fails, the customer DB record also rolls back — no orphan customers.
     */
    @Override
    @Transactional
    public CustomerResponseDTO createCustomer(CustomerRequestDTO request) {

        // 1. Save the Customer record
        Customer customer = Customer.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .build();

        Customer savedCustomer = customerRepository.save(customer);

        // 2. Auto-create a SAVINGS Account with ₹0 balance
        //    Account number: "SAV" + zero-padded customer ID → e.g. SAV0000000001
        String accountNumber = "SAV" + String.format("%010d", savedCustomer.getId());

        Account account = Account.builder()
                .accountNumber(accountNumber)
                .accountType("SAVINGS")
                .balance(0.0)
                .status(AccountStatus.ACTIVE)
                .customer(savedCustomer)
                .build();

        accountRepository.save(account);

        // 3. Create the Keycloak user:
        //    - Assigns CUSTOMER role
        //    - Sets VERIFY_EMAIL required action → Keycloak sends verification email
        //    - Sets UPDATE_PASSWORD required action → forced on first login
        //    - Returns the Keycloak UUID (stored as keycloakId)
        String keycloakId = keycloakAdminService.createCustomerUser(
                savedCustomer.getEmail(),
                savedCustomer.getFullName()
        );

        // 4. Store the Keycloak UUID on the Customer record
        //    This links JWT "sub" claim → Customer DB record for portal APIs
        savedCustomer.setKeycloakId(keycloakId);
        customerRepository.save(savedCustomer);

        return mapToResponse(savedCustomer);
    }

    @Override
    public List<CustomerResponseDTO> getAllCustomers() {
        return customerRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerResponseDTO getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return mapToResponse(customer);
    }

    @Override
    public CustomerResponseDTO updateCustomer(Long id, CustomerRequestDTO request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        customer.setFullName(request.getFullName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());

        Customer updatedCustomer = customerRepository.save(customer);
        return mapToResponse(updatedCustomer);
    }

    /**
     * Deletes a customer and ALL related data in the correct FK order:
     *   1. Transactions (FK → accounts)
     *   2. Accounts (FK → customers)
     *   3. Beneficiaries (FK → customers)
     *   4. Customer record
     *   5. Keycloak user (non-fatal if fails)
     *
     * Entire DB deletion is @Transactional — rolls back if any step fails.
     * Keycloak deletion is outside the transaction (non-fatal warning on failure).
     */
    @Override
    @Transactional
    public void deleteCustomer(Long id) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        // Step 1: Delete all transactions on all accounts of this customer
        // Must happen before deleting accounts (FK: transactions.account_id → accounts.id)
        accountRepository.findByCustomerId(id)
                .forEach(account ->
                        transactionRepository.deleteByAccountId(account.getId()));

        // Step 2: Delete all accounts belonging to this customer
        // Must happen before deleting the customer (FK: accounts.customer_id → customers.id)
        accountRepository.deleteByCustomerId(id);

        // Step 3: Delete all beneficiaries belonging to this customer
        // Must happen before deleting the customer (FK: beneficiaries.customer_id → customers.id)
        beneficiaryRepository.deleteByCustomerId(id);

        // Step 4: Delete the customer record
        customerRepository.delete(customer);

        // Step 5: Delete the Keycloak login account (non-fatal — runs after DB commit)
        // If keycloakId is null (old customer before Keycloak integration), this is a no-op
        keycloakAdminService.deleteKeycloakUser(customer.getKeycloakId());
    }

    private CustomerResponseDTO mapToResponse(Customer customer) {
        CustomerResponseDTO response = new CustomerResponseDTO();
        response.setId(customer.getId());
        response.setFullName(customer.getFullName());
        response.setEmail(customer.getEmail());
        response.setPhone(customer.getPhone());
        response.setAddress(customer.getAddress());
        response.setCreatedAt(customer.getCreatedAt());
        return response;
    }
}
