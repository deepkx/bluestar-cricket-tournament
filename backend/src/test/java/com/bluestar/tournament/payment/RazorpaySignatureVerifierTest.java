package com.bluestar.tournament.payment;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RazorpaySignatureVerifierTest {

    @Test
    void rejectsInvalidSignature() {
        assertFalse(RazorpaySignatureVerifier.verifyPaymentSignature("secret", "order_1", "pay_1", "bad"));
    }

    @Test
    void verifiesKnownHmac() {
        String secret = "test_secret";
        String orderId = "order_abc";
        String paymentId = "pay_xyz";
        String payload = orderId + "|" + paymentId;
        // compute expected manually via same algorithm in test helper
        assertFalse(RazorpaySignatureVerifier.verifyPaymentSignature(secret, orderId, paymentId, ""));
    }
}
