package com.bluestar.tournament.domain;

public enum RegistrationStatus {
    PENDING_PAYMENT,
    PAYMENT_PROCESSING,
    CONFIRMED,
    PAYMENT_FAILED,
    CANCELLED,
    REFUND_PENDING,
    REFUNDED
}
