package com.bluestar.tournament.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class AdminTokenService {

    private final byte[] secret;
    private static final long TTL_SECONDS = 86400;

    public AdminTokenService(@Value("${app.jwt-secret:change-me-in-production-use-long-secret}") String secret) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
    }

    public String createToken(Long adminId, String email) {
        long exp = Instant.now().getEpochSecond() + TTL_SECONDS;
        String payload = adminId + ":" + email + ":" + exp;
        String sig = sign(payload);
        return Base64.getUrlEncoder().withoutPadding().encodeToString((payload + ":" + sig).getBytes(StandardCharsets.UTF_8));
    }

    public AdminPrincipal parse(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        try {
            String decoded = new String(Base64.getUrlDecoder().decode(token), StandardCharsets.UTF_8);
            String[] parts = decoded.split(":");
            if (parts.length != 4) {
                return null;
            }
            long adminId = Long.parseLong(parts[0]);
            String email = parts[1];
            long exp = Long.parseLong(parts[2]);
            String sig = parts[3];
            if (Instant.now().getEpochSecond() > exp) {
                return null;
            }
            String payload = parts[0] + ":" + parts[1] + ":" + parts[2];
            if (!sign(payload).equals(sig)) {
                return null;
            }
            return new AdminPrincipal(adminId, email);
        } catch (Exception e) {
            return null;
        }
    }

    private String sign(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
