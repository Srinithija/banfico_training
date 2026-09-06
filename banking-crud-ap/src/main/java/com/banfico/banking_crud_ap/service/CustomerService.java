package com.banfico.banking_crud_ap.service;

import com.banfico.banking_crud_ap.dto.request.CustomerRequestDTO;
import com.banfico.banking_crud_ap.dto.response.CustomerResponseDTO;

import java.util.List;

public interface CustomerService {

    CustomerResponseDTO createCustomer(CustomerRequestDTO request);

    List<CustomerResponseDTO> getAllCustomers();

    CustomerResponseDTO getCustomerById(Long id);

    CustomerResponseDTO updateCustomer(Long id, CustomerRequestDTO request);

    void deleteCustomer(Long id);
}