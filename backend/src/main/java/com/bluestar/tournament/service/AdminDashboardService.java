package com.bluestar.tournament.service;

import com.bluestar.tournament.domain.PaymentStatus;
import com.bluestar.tournament.domain.RegistrationStatus;
import com.bluestar.tournament.dto.AdminDashboardDto;
import com.bluestar.tournament.entity.Tournament;
import com.bluestar.tournament.repository.PaymentRepository;
import com.bluestar.tournament.repository.RegistrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AdminDashboardService {

    private final TournamentService tournamentService;
    private final RegistrationRepository registrationRepository;
    private final PaymentRepository paymentRepository;

    public AdminDashboardService(
            TournamentService tournamentService,
            RegistrationRepository registrationRepository,
            PaymentRepository paymentRepository) {
        this.tournamentService = tournamentService;
        this.registrationRepository = registrationRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public AdminDashboardDto dashboard() {
        Tournament t = tournamentService.requireCurrent();
        Instant now = Instant.now();
        long occupied = registrationRepository.countOccupiedSlots(t.getId(), now);
        long confirmed = registrationRepository.countByTournamentIdAndStatus(t.getId(), RegistrationStatus.CONFIRMED);
        long pending = registrationRepository.countByTournamentIdAndStatus(t.getId(), RegistrationStatus.PENDING_PAYMENT)
                + registrationRepository.countByTournamentIdAndStatus(t.getId(), RegistrationStatus.PAYMENT_PROCESSING);
        long failed = registrationRepository.countByTournamentIdAndStatus(t.getId(), RegistrationStatus.PAYMENT_FAILED);
        long collections = paymentRepository.sumPaidAmountPaise();
        return new AdminDashboardDto(
                t.getMaxTeams(),
                (int) confirmed,
                (int) pending,
                (int) failed,
                (int) Math.max(0, t.getMaxTeams() - occupied),
                collections,
                t.isFixturesPublished()
        );
    }
}
