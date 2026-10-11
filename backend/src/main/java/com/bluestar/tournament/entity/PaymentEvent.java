package com.bluestar.tournament.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "payment_events")
public class PaymentEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "provider_event_id", nullable = false, unique = true)
    private String providerEventId;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private Payment payment;

    @Column(name = "processing_status", nullable = false)
    private String processingStatus;

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt;

    @PrePersist
    void prePersist() {
        if (receivedAt == null) {
            receivedAt = Instant.now();
        }
    }

    public Long getId() { return id; }
    public String getProviderEventId() { return providerEventId; }
    public void setProviderEventId(String providerEventId) { this.providerEventId = providerEventId; }
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public Payment getPayment() { return payment; }
    public void setPayment(Payment payment) { this.payment = payment; }
    public String getProcessingStatus() { return processingStatus; }
    public void setProcessingStatus(String processingStatus) { this.processingStatus = processingStatus; }
    public Instant getReceivedAt() { return receivedAt; }
}
