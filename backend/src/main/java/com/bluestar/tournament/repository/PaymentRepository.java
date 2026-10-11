package com.bluestar.tournament.repository;

import com.bluestar.tournament.domain.PaymentStatus;
import com.bluestar.tournament.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByProviderOrderId(String providerOrderId);

    Optional<Payment> findTopByRegistrationIdOrderByCreatedAtDesc(Long registrationId);

    Page<Payment> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByPaymentStatus(PaymentStatus status);

    @Query("SELECT COALESCE(SUM(p.amountPaise), 0) FROM Payment p WHERE p.paymentStatus = com.bluestar.tournament.domain.PaymentStatus.PAID")
    long sumPaidAmountPaise();
}
