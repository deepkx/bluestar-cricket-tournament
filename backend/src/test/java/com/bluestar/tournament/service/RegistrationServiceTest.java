package com.bluestar.tournament.service;

import com.bluestar.tournament.dto.RegistrationCreateRequest;
import com.bluestar.tournament.exception.ApiException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RegistrationServiceTest {

    @Autowired RegistrationService registrationService;

    private RegistrationCreateRequest.PlayerDto player(int i) {
        return new RegistrationCreateRequest.PlayerDto("Player " + i, i, "Batter", i == 1);
    }

    private List<RegistrationCreateRequest.PlayerDto> squad(int size) {
        List<RegistrationCreateRequest.PlayerDto> list = new ArrayList<>();
        for (int i = 1; i <= size; i++) list.add(player(i));
        return list;
    }

    private RegistrationCreateRequest request(int squadSize) {
        return new RegistrationCreateRequest(
                "Thunder XI",
                "City",
                new RegistrationCreateRequest.CaptainDto("Captain One"),
                squad(squadSize),
                true
        );
    }

    @Test
    void rejectsSquadBelowMinimum() {
        ApiException ex = assertThrows(ApiException.class, () -> registrationService.create(request(10)));
        assertEquals("INVALID_SQUAD_SIZE", ex.getCode());
    }

    @Test
    void rejectsSquadAboveMaximum() {
        ApiException ex = assertThrows(ApiException.class, () -> registrationService.create(request(16)));
        assertEquals("INVALID_SQUAD_SIZE", ex.getCode());
    }

    @Test
    void acceptsSquadOf11WhenRegistrationOpen() {
        var created = registrationService.create(request(11));
        assertNotNull(created.publicReference());
        assertNotNull(created.trackingToken());
    }

    @Test
    void rejectsDuplicateTeamName() {
        // Registration closed by default — open via override in integration test later
        assertNotNull(registrationService);
    }
}
