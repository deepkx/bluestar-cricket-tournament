package com.bluestar.tournament.controller;

import com.bluestar.tournament.dto.*;
import com.bluestar.tournament.service.PaymentService;
import com.bluestar.tournament.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/registrations")
public class RegistrationController {

    private final RegistrationService registrationService;
    private final PaymentService paymentService;

    public RegistrationController(RegistrationService registrationService, PaymentService paymentService) {
        this.registrationService = registrationService;
        this.paymentService = paymentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RegistrationCreatedResponse create(@Valid @RequestBody RegistrationCreateRequest request) {
        return registrationService.create(request);
    }

    @PostMapping(value = "/with-media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public RegistrationCreatedResponse createWithMedia(
            @Valid @RequestPart("payload") RegistrationCreateRequest request,
            @RequestPart("teamLogo") MultipartFile teamLogo,
            @RequestPart("playerPhotos") List<MultipartFile> playerPhotos) {
        return registrationService.createWithMedia(request, teamLogo, playerPhotos);
    }

    @GetMapping("/{reference}")
    public RegistrationStatusResponse status(
            @PathVariable String reference,
            @RequestHeader("X-Tracking-Token") String trackingToken) {
        return registrationService.getStatus(reference, trackingToken);
    }

    @PostMapping("/{reference}/payment-order")
    public PaymentOrderResponse paymentOrder(
            @PathVariable String reference,
            @RequestHeader("X-Tracking-Token") String trackingToken) {
        return paymentService.createOrder(reference, trackingToken);
    }

    @PostMapping("/{reference}/verify-payment")
    public RegistrationStatusResponse verifyPayment(
            @PathVariable String reference,
            @RequestHeader("X-Tracking-Token") String trackingToken,
            @Valid @RequestBody PaymentVerifyRequest body) {
        return paymentService.verifyCheckout(reference, trackingToken, body);
    }
}
