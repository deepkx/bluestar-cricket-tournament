package com.bluestar.tournament.controller;

import com.bluestar.tournament.dto.AdminPaymentDto;
import com.bluestar.tournament.entity.Payment;
import com.bluestar.tournament.repository.PaymentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/payments")
public class AdminPaymentController {

    private final PaymentRepository paymentRepository;

    public AdminPaymentController(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @GetMapping
    public Page<AdminPaymentDto> list(Pageable pageable) {
        return paymentRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toDto);
    }

    private AdminPaymentDto toDto(Payment p) {
        return new AdminPaymentDto(
                p.getId(),
                p.getRegistration().getPublicReference(),
                p.getRegistration().getTeamName(),
                p.getAmountPaise(),
                p.getCurrency(),
                p.getProviderOrderId(),
                p.getProviderPaymentId(),
                p.getPaymentStatus().name(),
                p.getPaidAt()
        );
    }
}
