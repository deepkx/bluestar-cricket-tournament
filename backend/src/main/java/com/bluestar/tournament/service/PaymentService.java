package com.bluestar.tournament.service;

import com.bluestar.tournament.domain.PaymentStatus;
import com.bluestar.tournament.domain.RegistrationStatus;
import com.bluestar.tournament.dto.PaymentOrderResponse;
import com.bluestar.tournament.dto.PaymentVerifyRequest;
import com.bluestar.tournament.dto.RegistrationStatusResponse;
import com.bluestar.tournament.entity.Payment;
import com.bluestar.tournament.entity.PaymentEvent;
import com.bluestar.tournament.entity.Registration;
import com.bluestar.tournament.exception.ApiException;
import com.bluestar.tournament.payment.RazorpayService;
import com.bluestar.tournament.payment.RazorpaySignatureVerifier;
import com.bluestar.tournament.repository.PaymentEventRepository;
import com.bluestar.tournament.repository.PaymentRepository;
import com.bluestar.tournament.repository.RegistrationRepository;
import com.razorpay.Order;
import org.json.JSONObject;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentEventRepository paymentEventRepository;
    private final RegistrationRepository registrationRepository;
    private final RegistrationService registrationService;
    private final RazorpayService razorpayService;

    public PaymentService(
            PaymentRepository paymentRepository,
            PaymentEventRepository paymentEventRepository,
            RegistrationRepository registrationRepository,
            RegistrationService registrationService,
            RazorpayService razorpayService) {
        this.paymentRepository = paymentRepository;
        this.paymentEventRepository = paymentEventRepository;
        this.registrationRepository = registrationRepository;
        this.registrationService = registrationService;
        this.razorpayService = razorpayService;
    }

    @Transactional
    public PaymentOrderResponse createOrder(String reference, String trackingToken) {
        Registration reg = registrationService.requireForPayment(reference, trackingToken);
        if (reg.getStatus() == RegistrationStatus.CONFIRMED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ALREADY_CONFIRMED", "Already confirmed");
        }

        Payment existing = paymentRepository.findTopByRegistrationIdOrderByCreatedAtDesc(reg.getId()).orElse(null);
        if (existing != null && existing.getPaymentStatus() == PaymentStatus.PAID) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ALREADY_PAID", "Payment already completed");
        }

        long amount = reg.getTournament().getEntryFeePaise();
        Order order = razorpayService.createOrder(amount, reg.getPublicReference(), reg.getPublicReference());

        Payment payment = existing != null && existing.getPaymentStatus() != PaymentStatus.PAID
                ? existing : new Payment();
        payment.setRegistration(reg);
        payment.setAmountPaise(amount);
        payment.setCurrency("INR");
        payment.setProviderOrderId(String.valueOf(order.get("id")));
        payment.setPaymentStatus(PaymentStatus.CREATED);
        paymentRepository.save(payment);

        reg.setStatus(RegistrationStatus.PAYMENT_PROCESSING);
        registrationRepository.save(reg);

        return new PaymentOrderResponse(
                String.valueOf(order.get("id")),
                amount,
                "INR",
                razorpayService.publicKeyId(),
                reg.getTeamName(),
                reg.getContact().getEmail() != null ? reg.getContact().getEmail() : "",
                reg.getContact().getPhone() != null ? reg.getContact().getPhone() : ""
        );
    }

    @Transactional
    public RegistrationStatusResponse verifyCheckout(String reference, String trackingToken, PaymentVerifyRequest body) {
        Registration reg = registrationService.requireForPayment(reference, trackingToken);
        Payment payment = paymentRepository.findByProviderOrderId(body.razorpayOrderId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ORDER", "Order not found"));

        if (!payment.getRegistration().getId().equals(reg.getId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ORDER_MISMATCH", "Order does not match registration");
        }

        boolean valid = RazorpaySignatureVerifier.verifyPaymentSignature(
                razorpayService.keySecret(),
                body.razorpayOrderId(),
                body.razorpayPaymentId(),
                body.razorpaySignature()
        );
        if (!valid) {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            reg.setStatus(RegistrationStatus.PAYMENT_FAILED);
            paymentRepository.save(payment);
            registrationRepository.save(reg);
            throw new ApiException(HttpStatus.BAD_REQUEST, "SIGNATURE_INVALID", "Payment verification failed");
        }

        confirmPayment(payment, body.razorpayPaymentId(), body.razorpayOrderId());
        return registrationService.getStatus(reference, trackingToken);
    }

    @Transactional
    public void handleWebhook(String rawBody, String signature) {
        String webhookSecret = razorpayService.webhookSecret();
        if (webhookSecret == null || webhookSecret.isBlank()) {
            throw new ApiException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "WEBHOOK_NOT_CONFIGURED",
                    "Webhook secret not configured");
        }
        if (!RazorpaySignatureVerifier.verifyWebhookSignature(webhookSecret, rawBody, signature)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "WEBHOOK_INVALID", "Invalid webhook signature");
        }
        JSONObject event = new JSONObject(rawBody);
        String eventId = event.getString("id");
        if (paymentEventRepository.existsByProviderEventId(eventId)) {
            return;
        }
        PaymentEvent pe = new PaymentEvent();
        pe.setProviderEventId(eventId);
        pe.setEventType(event.getString("event"));
        pe.setProcessingStatus("RECEIVED");
        paymentEventRepository.save(pe);

        if ("payment.captured".equals(event.getString("event"))) {
            JSONObject paymentEntity = event.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
            processCapturedPayment(paymentEntity, pe);
        }
        pe.setProcessingStatus("PROCESSED");
        paymentEventRepository.save(pe);
    }

    private void processCapturedPayment(JSONObject paymentEntity, PaymentEvent pe) {
        String orderId = paymentEntity.getString("order_id");
        String paymentId = paymentEntity.getString("id");
        long amount = paymentEntity.getLong("amount");
        String currency = paymentEntity.getString("currency");

        Payment payment = paymentRepository.findByProviderOrderId(orderId).orElse(null);
        if (payment == null) {
            return;
        }
        pe.setPayment(payment);
        if (payment.getPaymentStatus() == PaymentStatus.PAID) {
            return;
        }
        if (amount != payment.getAmountPaise() || !"INR".equals(currency)) {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            return;
        }
        confirmPayment(payment, paymentId, orderId);
    }

    private void confirmPayment(Payment payment, String providerPaymentId, String providerOrderId) {
        Registration reg = payment.getRegistration();
        if (reg.getStatus() == RegistrationStatus.CONFIRMED) {
            return;
        }
        payment.setProviderPaymentId(providerPaymentId);
        payment.setProviderOrderId(providerOrderId);
        payment.setPaymentStatus(PaymentStatus.PAID);
        payment.setPaidAt(Instant.now());
        paymentRepository.save(payment);

        reg.setStatus(RegistrationStatus.CONFIRMED);
        reg.setConfirmedAt(Instant.now());
        reg.setSlotReservationExpiresAt(null);
        registrationRepository.save(reg);
    }
}
