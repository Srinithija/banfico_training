package com.banfico.banking_crud_ap.repository;

import com.banfico.banking_crud_ap.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // Used by CustomerPortalServiceImpl to resolve JWT "sub" claim → Customer record
    Optional<Customer> findByKeycloakId(String keycloakId);
}
