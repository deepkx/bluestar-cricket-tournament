package com.bluestar.tournament.payment;

import com.bluestar.tournament.config.AppProperties;
import com.bluestar.tournament.exception.ApiException;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class RazorpayService {

    private static final Logger log = LoggerFactory.getLogger(RazorpayService.class);

    private final AppProperties appProperties;

    public RazorpayService(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    public Order createOrder(long amountPaise, String receipt, String notesRegistrationRef) {
        String keyId = appProperties.razorpay().keyId();
        String keySecret = appProperties.razorpay().keySecret();
        if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "PAYMENT_NOT_CONFIGURED",
                    "Payment gateway is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
        }
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject options = new JSONObject();
            options.put("amount", amountPaise);
            options.put("currency", "INR");
            options.put("receipt", receipt);
            JSONObject notes = new JSONObject();
            notes.put("registration_ref", notesRegistrationRef);
            options.put("notes", notes);
            return client.orders.create(options);
        } catch (RazorpayException e) {
            log.warn("Razorpay order create failed: {}", e.getMessage());
            throw new ApiException(
                    HttpStatus.BAD_GATEWAY,
                    "RAZORPAY_ERROR",
                    "Failed to create payment order. Check test/live keys match dashboard mode.");
        }
    }

    public String publicKeyId() {
        return appProperties.razorpay().keyId();
    }

    public String webhookSecret() {
        return appProperties.razorpay().webhookSecret();
    }

    public String keySecret() {
        return appProperties.razorpay().keySecret();
    }
}
