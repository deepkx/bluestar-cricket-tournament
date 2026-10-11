package com.bluestar.tournament.payment;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

public final class RazorpaySignatureVerifier {

    private RazorpaySignatureVerifier() {}

    public static boolean verifyPaymentSignature(String secret, String orderId, String paymentId, String signature) {
        if (secret == null || secret.isBlank() || signature == null) {
            return false;
        }
        String payload = orderId + "|" + paymentId;
        String expected = hmacSha256(secret, payload);
        return constantTimeEquals(expected, signature);
    }

    public static boolean verifyWebhookSignature(String secret, String rawBody, String signature) {
        if (secret == null || secret.isBlank() || signature == null) {
            return false;
        }
        String expected = hmacSha256(secret, rawBody);
        return constantTimeEquals(expected, signature);
    }

    private static String hmacSha256(String secret, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new IllegalStateException("HMAC failed", e);
        }
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }
}
