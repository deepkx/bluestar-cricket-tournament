package com.bluestar.tournament.controller;

import com.bluestar.tournament.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments/razorpay")
public class RazorpayWebhookController {

    private final PaymentService paymentService;

    public RazorpayWebhookController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(
            @RequestBody String rawBody,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        paymentService.handleWebhook(rawBody, signature);
        return ResponseEntity.ok().build();
    }
}
