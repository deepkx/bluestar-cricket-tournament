package com.bluestar.tournament.repository;

import com.bluestar.tournament.entity.TournamentMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TournamentMatchRepository extends JpaRepository<TournamentMatch, Long> {

    List<TournamentMatch> findByTournamentIdAndPublishedTrueOrderByRoundNumberAscBracketSlotAsc(Long tournamentId);

    List<TournamentMatch> findByTournamentIdOrderByRoundNumberAscBracketSlotAsc(Long tournamentId);

    Optional<TournamentMatch> findByTournamentIdAndRoundNumberAndBracketSlot(Long tournamentId, int roundNumber, int bracketSlot);

    List<TournamentMatch> findByTournamentIdAndMatchStatusAndPublishedTrueOrderByScheduledAtDesc(
            Long tournamentId, com.bluestar.tournament.domain.MatchStatus status);
}
