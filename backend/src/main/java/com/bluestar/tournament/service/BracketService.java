package com.bluestar.tournament.service;

import com.bluestar.tournament.entity.Registration;
import com.bluestar.tournament.entity.TournamentMatch;
import com.bluestar.tournament.repository.TournamentMatchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class BracketService {

    private final TournamentMatchRepository matchRepository;

    public BracketService(TournamentMatchRepository matchRepository) {
        this.matchRepository = matchRepository;
    }

    @Transactional
    public void advanceWinner(TournamentMatch completed) {
        Registration winner = completed.getWinner();
        if (winner == null) {
            return;
        }
        int nextRound = completed.getRoundNumber() + 1;
        if (nextRound > 5) {
            return;
        }
        int nextSlot = completed.getBracketSlot() / 2;
        boolean slotA = completed.getBracketSlot() % 2 == 0;

        Optional<TournamentMatch> nextOpt = matchRepository
                .findByTournamentIdAndRoundNumberAndBracketSlot(
                        completed.getTournament().getId(), nextRound, nextSlot);
        if (nextOpt.isEmpty()) {
            return;
        }
        TournamentMatch next = nextOpt.get();
        if (slotA) {
            if (next.getTeamA() == null) {
                next.setTeamA(winner);
            }
        } else {
            if (next.getTeamB() == null) {
                next.setTeamB(winner);
            }
        }
        matchRepository.save(next);
    }
}
