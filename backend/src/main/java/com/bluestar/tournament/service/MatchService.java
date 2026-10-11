package com.bluestar.tournament.service;

import com.bluestar.tournament.domain.MatchStatus;
import com.bluestar.tournament.dto.MatchPublicDto;
import com.bluestar.tournament.dto.MatchResultRequest;
import com.bluestar.tournament.entity.Registration;
import com.bluestar.tournament.entity.Tournament;
import com.bluestar.tournament.entity.TournamentMatch;
import com.bluestar.tournament.exception.ApiException;
import com.bluestar.tournament.repository.RegistrationRepository;
import com.bluestar.tournament.repository.TournamentMatchRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MatchService {

    private final TournamentMatchRepository matchRepository;
    private final TournamentService tournamentService;
    private final RegistrationRepository registrationRepository;
    private final BracketService bracketService;

    public MatchService(
            TournamentMatchRepository matchRepository,
            TournamentService tournamentService,
            RegistrationRepository registrationRepository,
            BracketService bracketService) {
        this.matchRepository = matchRepository;
        this.tournamentService = tournamentService;
        this.registrationRepository = registrationRepository;
        this.bracketService = bracketService;
    }

    @Transactional(readOnly = true)
    public List<MatchPublicDto> publicMatches(boolean resultsOnly) {
        Tournament t = tournamentService.requireCurrent();
        return matchRepository.findByTournamentIdAndPublishedTrueOrderByRoundNumberAscBracketSlotAsc(t.getId())
                .stream()
                .filter(m -> !resultsOnly || m.getMatchStatus() == MatchStatus.COMPLETED)
                .map(this::toPublic)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MatchPublicDto> bracketView() {
        Tournament t = tournamentService.requireCurrent();
        return matchRepository.findByTournamentIdOrderByRoundNumberAscBracketSlotAsc(t.getId())
                .stream()
                .map(this::toPublic)
                .toList();
    }

    @Transactional
    public MatchPublicDto recordResult(Long matchId, MatchResultRequest request) {
        TournamentMatch match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Match not found"));
        if (match.getMatchStatus() == MatchStatus.COMPLETED && match.getWinner() != null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ALREADY_COMPLETED", "Match already completed");
        }
        Registration winner = registrationRepository.findById(request.winnerRegistrationId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "INVALID_WINNER", "Winner team not found"));
        Long wId = winner.getId();
        if (match.getTeamA() != null && match.getTeamB() != null) {
            if (!wId.equals(match.getTeamA().getId()) && !wId.equals(match.getTeamB().getId())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "WINNER_NOT_IN_MATCH", "Winner must be one of the teams");
            }
        }
        match.setWinner(winner);
        match.setResultSummary(request.resultSummary());
        match.setMatchStatus(MatchStatus.COMPLETED);
        matchRepository.save(match);
        bracketService.advanceWinner(match);
        return toPublic(match);
    }

    private MatchPublicDto toPublic(TournamentMatch m) {
        return new MatchPublicDto(
                m.getId(),
                m.getRoundNumber(),
                m.getMatchNumber(),
                m.getBracketSlot(),
                teamName(m.getTeamA()),
                teamName(m.getTeamB()),
                m.getTeamA() != null ? m.getTeamA().getId() : null,
                m.getTeamB() != null ? m.getTeamB().getId() : null,
                m.getScheduledAt(),
                m.getVenue(),
                teamName(m.getWinner()),
                m.getResultSummary(),
                m.getMatchStatus().name(),
                m.isPublished()
        );
    }

    private static String teamName(Registration r) {
        return r == null ? null : r.getTeamName();
    }
}
