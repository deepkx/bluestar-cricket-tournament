package com.bluestar.tournament.dto;

import jakarta.validation.constraints.NotBlank;

public record PaymentVerifyRequest(
        @NotBlank String razorpayPaymentId,
        @NotBlank String razorpayOrderId,
        @NotBlank String razorpaySignature
) {}
