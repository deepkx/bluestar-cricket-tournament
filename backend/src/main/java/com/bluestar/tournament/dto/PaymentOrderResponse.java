package com.bluestar.tournament.dto;

public record PaymentOrderResponse(
        String orderId,
        long amountPaise,
        String currency,
        String razorpayKeyId,
        String teamName,
        String prefillEmail,
        String prefillContact
) {}
