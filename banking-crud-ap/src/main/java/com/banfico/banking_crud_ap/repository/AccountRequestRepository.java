package com.banfico.banking_crud_ap.repository;

import com.banfico.banking_crud_ap.entity.AccountRequest;
import com.banfico.banking_crud_ap.entity.AccountRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountRequestRepository extends JpaRepository<AccountRequest, Long> {

    // All requests for a specific customer (for customer portal)
    List<AccountRequest> findByCustomerIdOrderByRequestedAtDesc(Long customerId);

    // All requests with a specific status (for admin dashboard)
    List<AccountRequest> findByStatusOrderByRequestedAtDesc(AccountRequestStatus status);

    // All requests regardless of status (for admin — all view)
    List<AccountRequest> findAllByOrderByRequestedAtDesc();
}
