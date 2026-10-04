package com.banfico.banking_crud_ap.repository;

import com.banfico.banking_crud_ap.entity.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {

    List<Beneficiary> findByCustomerId(Long customerId);

    // Used during cascading customer deletion.
    // clearAutomatically=true evicts stale Beneficiary entities from the session cache
    // after bulk delete, preventing flush conflicts.
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM Beneficiary b WHERE b.customer.id = :customerId")
    void deleteByCustomerId(@Param("customerId") Long customerId);
}
