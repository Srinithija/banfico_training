package com.banfico.banking_crud_ap.repository;

import com.banfico.banking_crud_ap.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByAccountNumber(String accountNumber);

    // Used by CustomerPortalServiceImpl to fetch a customer's own accounts
    List<Account> findByCustomerId(Long customerId);

    // Used during cascading customer deletion.
    // clearAutomatically=true evicts stale Account entities from the session cache
    // after bulk delete, preventing TransientPropertyValueException on flush.
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM Account a WHERE a.customer.id = :customerId")
    void deleteByCustomerId(@Param("customerId") Long customerId);
}
