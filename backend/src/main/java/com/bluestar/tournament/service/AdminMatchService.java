package com.bluestar.tournament.service;

import com.bluestar.tournament.domain.MatchStatus;
import com.bluestar.tournament.dto.AdminMatchRequest;
import com.bluestar.tournament.dto.MatchPublicDto;
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
public class AdminMatchService {

    private final TournamentMatchRepository matchRepository;
    private final TournamentService tournamentService;
    private final RegistrationRepository registrationRepository;
    private final MatchService matchService;

    public AdminMatchService(
            TournamentMatchRepository matchRepository,
            TournamentService tournamentService,
            RegistrationRepository registrationRepository,
            MatchService matchService) {
        this.matchRepository = matchRepository;
        this.tournamentService = tournamentService;
        this.registrationRepository = registrationRepository;
        this.matchService = matchService;
    }

    @Transactional(readOnly = true)
    public List<MatchPublicDto> listAll() {
        return matchService.bracketView();
    }

    @Transactional
    public MatchPublicDto create(AdminMatchRequest req) {
        if (req.roundNumber() == null || req.matchNumber() == null || req.bracketSlot() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION", "roundNumber, matchNumber, and bracketSlot are required");
        }
        Tournament t = tournamentService.requireCurrent();
        TournamentMatch m = new TournamentMatch();
        m.setTournament(t);
        m.setRoundNumber(req.roundNumber());
        m.setMatchNumber(req.matchNumber());
        m.setBracketSlot(req.bracketSlot());
        m.setTeamA(resolveTeam(req.teamARegistrationId()));
        m.setTeamB(resolveTeam(req.teamBRegistrationId()));
        m.setScheduledAt(req.scheduledAt());
        m.setVenue(req.venue());
        m.setNotes(req.notes());
        m.setPublished(req.published() != null && req.published());
        m.setMatchStatus(MatchStatus.SCHEDULED);
        matchRepository.save(m);
        return matchService.bracketView().stream().filter(x -> x.id().equals(m.getId())).findFirst()
                .orElseThrow();
    }

    @Transactional
    public MatchPublicDto update(Long id, AdminMatchRequest req) {
        TournamentMatch m = matchRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Match not found"));
        if (req.roundNumber() != null) m.setRoundNumber(req.roundNumber());
        if (req.matchNumber() != null) m.setMatchNumber(req.matchNumber());
        if (req.bracketSlot() != null) m.setBracketSlot(req.bracketSlot());
        if (req.teamARegistrationId() != null) m.setTeamA(resolveTeam(req.teamARegistrationId()));
        if (req.teamBRegistrationId() != null) m.setTeamB(resolveTeam(req.teamBRegistrationId()));
        if (req.scheduledAt() != null) m.setScheduledAt(req.scheduledAt());
        if (req.venue() != null) m.setVenue(req.venue());
        if (req.notes() != null) m.setNotes(req.notes());
        if (req.published() != null) m.setPublished(req.published());
        if (req.matchStatus() != null) m.setMatchStatus(MatchStatus.valueOf(req.matchStatus()));
        matchRepository.save(m);
        return matchService.bracketView().stream().filter(x -> x.id().equals(id)).findFirst().orElseThrow();
    }

    private Registration resolveTeam(Long id) {
        if (id == null) return null;
        return registrationRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "INVALID_TEAM", "Team not found"));
    }
}
