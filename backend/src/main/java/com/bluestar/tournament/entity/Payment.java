package com.bluestar.tournament.entity;

import com.bluestar.tournament.domain.PaymentStatus;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registration_id")
    private Registration registration;

    @Column(name = "amount_paise", nullable = false)
    private Long amountPaise;

    @Column(nullable = false)
    private String currency;

    @Column(name = "provider_order_id", unique = true)
    private String providerOrderId;

    @Column(name = "provider_payment_id", unique = true)
    private String providerPaymentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "refund_status")
    private String refundStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Registration getRegistration() { return registration; }
    public void setRegistration(Registration registration) { this.registration = registration; }
    public Long getAmountPaise() { return amountPaise; }
    public void setAmountPaise(Long amountPaise) { this.amountPaise = amountPaise; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getProviderOrderId() { return providerOrderId; }
    public void setProviderOrderId(String providerOrderId) { this.providerOrderId = providerOrderId; }
    public String getProviderPaymentId() { return providerPaymentId; }
    public void setProviderPaymentId(String providerPaymentId) { this.providerPaymentId = providerPaymentId; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
    public Instant getPaidAt() { return paidAt; }
    public void setPaidAt(Instant paidAt) { this.paidAt = paidAt; }
    public String getRefundStatus() { return refundStatus; }
    public void setRefundStatus(String refundStatus) { this.refundStatus = refundStatus; }
}
