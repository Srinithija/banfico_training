package com.banfico.banking_crud_ap.repository;

import com.banfico.banking_crud_ap.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByAccountId(Long accountId);

    // Deletes all transactions linked to a specific account.
    // clearAutomatically=true evicts stale entities from the session cache
    // after the bulk delete, preventing TransientPropertyValueException on flush.
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM Transaction t WHERE t.account.id = :accountId")
    void deleteByAccountId(@Param("accountId") Long accountId);
}
