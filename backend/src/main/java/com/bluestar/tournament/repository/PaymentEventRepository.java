package com.bluestar.tournament.repository;

import com.bluestar.tournament.entity.PaymentEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentEventRepository extends JpaRepository<PaymentEvent, Long> {
    boolean existsByProviderEventId(String providerEventId);
}
